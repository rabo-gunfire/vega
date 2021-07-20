/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ApiClient } from "docusign-esign";
import superagent, { Response, ResponseError } from "superagent";
import { ConnectorError } from "../connectors/connector-error";
import { InvalidResponseError } from "../connectors/invalid-response-error";

export class DocuSignClient {
    private readonly baseUriSuffix: string = '/restapi'
    private readonly authorizationHeader: string = 'Authorization';
    private readonly authenticationScheme: string = 'Bearer';
    private apiUrl: string;
    private oauthServerUrl: string;
    private clientId: string;
    private clientSecret: string;
    private refreshToken: string;
    private accessToken!: string;

    /**
     * DocuSign eSignature API client.
     */
    private _dsApiClient: ApiClient;

    /**
     * Constructor to initialize DocuSign API client.
     */
    constructor(apiUrl: string, oauthServerUrl: string, clientId: string, clientSecret: string, refreshToken: string) {
        this.apiUrl = apiUrl;
        this.oauthServerUrl = oauthServerUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;

        this._dsApiClient = new ApiClient({ basePath: apiUrl + this.baseUriSuffix, oAuthBasePath: oauthServerUrl });
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
    getTokenUserInfo(): Promise<any> {
        return this.dsApiClient.getUserInfo(this.accessToken);
    }

    /**
     * Generates access token using refresh_token oAuth
     * flow and add access token to requests header.
     */
async refreshAccessToken(): Promise<void> {
        // generate token
        let token;
        try {
            token = await this.generateToken();
        } catch (error) {
            throw new ConnectorError('Failed to generate an access token.', error);
        }

        if (!token) {
            throw new InvalidResponseError('Found empty response in token generation.');
        }

        this.accessToken = token;

        // Add authorization header to the API client. Useful for Authentication.
        this.dsApiClient.addDefaultHeader(this.authorizationHeader, this.authenticationScheme + ' ' + this.accessToken);
    }

    private async generateToken(): Promise<string> {
        const clientString: string = this.clientId + ':' + this.clientSecret;
        const request = superagent.post(this.oauthServerUrl + '/oauth/token')
            .type('form')
            .accept('application/json')
            .set('Authorization', 'Basic ' + Buffer.from(clientString, 'utf-8').toString('base64'))
            .send({ grant_type: 'refresh_token' })
            .send({ refresh_token: this.refreshToken });

        return new Promise<string>((resolve, reject) => {
            request.end((err: ResponseError, res: Response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.body.access_token);
                }
            });
        });
    }
}
