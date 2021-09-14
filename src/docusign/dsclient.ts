/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ApiClient } from 'docusign-esign';
import moment, { Moment } from 'moment';
import { InvalidResponseError } from '../connectors/invalid-response-error';
import { convertToConnectorError } from '../tools/error-converter';
import { logger } from '../tools/logger';
import { executeRequestThrottleOn } from './request-throttler';

export class DocuSignClient {
    private readonly baseUriSuffix: string = '/restapi';
    private readonly authorizationHeader: string = 'Authorization';
    private readonly authenticationScheme: string = 'Bearer';
    private dsClientId: string;
    private impersonatedUserGuid: string;
    private rsaKey: string;
    private accessToken!: string;
    private tokenExpiresAt: Moment | undefined;

    /**
     * DocuSign eSignature API client.
     */
    private _dsApiClient: ApiClient;

    /**
     * Constructor to initialize DocuSign API client.
     *
     * @param {string} apiUrl - Account Base URI (API URL)
     * @param {string} clientId - DocuSign OAuth Client Id (AKA Integrator Key)
     * OAuth2 client ID: Identifies the client making the request.
     * Client applications may be scoped to a limited set of system access.
     * @param {string} impersonatedUserGuid - DocuSign user Id to be impersonated (This is a UUID)
     * @param {string} privateKey - RSA private key
     */
    constructor(apiUrl: string, clientId: string, userId: string, privateKey: string) {
        this.dsClientId = clientId;
        this.impersonatedUserGuid = userId;
        this.rsaKey = privateKey;

        this._dsApiClient = new ApiClient({ basePath: apiUrl + this.baseUriSuffix, oAuthBasePath: '' });
    }

    /**
     * Get the native docusign API client.
     */
    get dsApiClient(): ApiClient {
        return this._dsApiClient;
    }

    /**
     * Get user information from the access token.
     * @param accessToken the bearer token to use to authenticate for this call.
     *
     * @returns {any} OAuth UserInfo model.
     */
    async getTokenUserInfo(): Promise<any> {
        return executeRequestThrottleOn(this.dsApiClient.getUserInfo, this.dsApiClient, [this.accessToken]);
    }

    /**
     * Generates access token using JWT flow
     * and adds access token to requests header.
     */
    async refreshAccessToken(): Promise<void> {
        // if exiting token expires or doesn't
        // have, then create a new access token.
        if (this.checkToken()) {
            let token;
            try {
                token = await this.getToken();
            } catch (error) {
                convertToConnectorError(error);
            }

            if (!token) {
                throw new InvalidResponseError('Found empty response in token generation.');
            }

            this.accessToken = token;
        }

        // Add authorization header to the API client. Useful for Authentication.
        this.dsApiClient.addDefaultHeader(this.authorizationHeader, this.authenticationScheme + ' ' + this.accessToken);
    }

    /**
     * Async function to obtain a accessToken via JWT grant
     *
     * @returns {string} access_token
     */
    private async getToken(): Promise<string> {
        const jwtLifeSec = 10 * 60; // requested lifetime for the JWT is 10 min
        const scopes = ['signature', 'impersonation'];

        const token = await executeRequestThrottleOn(this.dsApiClient.requestJWTUserToken, this.dsApiClient, [
            this.dsClientId,
            this.impersonatedUserGuid,
            scopes,
            Buffer.from(this.rsaKey, 'utf8'),
            jwtLifeSec
        ]);

        this.tokenExpiresAt = moment().add(token.body.expires_in, 's');

        return token.body.access_token;
    }

    /**
     * This is the key method for the object.
     * It should be called before any API call to DocuSign.
     * It checks that the existing access access token can be used.
     * If the existing access token is expired or doesn't exist, then
     * a new access token will be obtained from DocuSign by using
     * the JWT flow.
     *
     * SIDE EFFECT: Sets the access access token that the SDK will use.
     */
    private checkToken(): boolean {
        const bufferMin = 10, // 10 minute buffer time
            noToken = !this.accessToken || !this.tokenExpiresAt,
            now = moment(),
            needToken = noToken || moment(this.tokenExpiresAt).subtract(bufferMin, 'm').isBefore(now);

        if (noToken) {
            logger.debug('checkToken: Starting up--need a token');
        }
        if (needToken && !noToken) {
            logger.debug('checkToken: Replacing old token');
        }
        if (!needToken) {
            logger.debug('checkToken: Using current token');
        }

        return needToken;
    }
}
