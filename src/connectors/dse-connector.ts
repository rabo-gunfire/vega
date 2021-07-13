/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { Group, GroupInformation, NewUsersSummary, UserInformation, UserInformationList, UsersResponse } from 'docusign-esign';
import { ResponseError } from 'superagent';

import {
    AttributeChange,
    Context,
    Response,
    StdAccountCreateInput,
    StdAccountCreateOutput,
    StdAccountDeleteInput,
    StdAccountDeleteOutput,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdAccountUpdateInput,
    StdAccountUpdateOutput,
    StdEntitlementListOutput,
    StdEntitlementReadInput,
    StdEntitlementReadOutput,
    StdTestConnectionOutput
} from '@sailpoint/connector-sdk';

import { DocuSignClient } from '../docusign/dsclient';
import { DocuSign } from '../docusign/docusign';
import { InvalidConfigurationError } from './InvalidConfigurationError';
import { InsufficientPermissionError } from './InsufficientPermissionError';
import { ConnectorError } from './ConnectorError';
import { InvalidRequestError } from './InvalidRequestError';
import { InvalidResponseError } from './InvalidResponseError';

/**
 * DocuSign eSignature connector 
 */
export class DseConnector {
    private docuSign: DocuSign;
    private accountId: string;

    /**
     * Constructor to initialize DocuSign client.
     * 
     * @param {Context} context - Source configuration context
     */
    constructor(context: Context) {
        let config: any = context.config;

        this.validateConfiguration(config);

        this.docuSign = new DocuSign(
            new DocuSignClient(config.apiUrl,
                config.oauthServerUrl,
                config.clientId,
                config.clientSecret,
                config.refreshToken));

        this.accountId = config.accountId;
    }

    /**
     * Connection check with DocuSign application.
     * 
     * @param {Response<StdTestConnectionOutput>} res - stream to write a response
     */
    async testConnection(res: Response<StdTestConnectionOutput>): Promise<void> {
        // Always refesh a token before interacting with DocuSign eSgintaure app
        await this.docuSign.dsClient.refreshAccessToekn();

        // Decode an access token and find a subject
        let result;
        try {
            result = await this.docuSign.dsClient.getTokenUserInfo()
        } catch (error) {
            this.convertToConnectorError(error);
        }

        if (!result) {
            throw new InvalidResponseError('Found empty response for token decode.');
        }

        // Load user associated with a token
        let user;
        try {
            user = await this.docuSign.getUser(this.accountId, result.sub);
        } catch (error) {
            this.convertToConnectorError(error);
        }

        if (!user) {
            throw new InvalidResponseError('Found empty response for user read.');
        }

        if ((user as any).errno && (user as any).code) {
            this.convertToConnectorError(user as any);
        }

        // success
        res.send({});
    }

    /**
     * Reads user account.
     * 
     * @param {StdAccountReadInput} input - native identifire information
     * @param {Response<StdAccountReadOutput>} res - stream to write a response
     */
    async readAccount(input: StdAccountReadInput,
        res: Response<StdAccountReadOutput>): Promise<void> {

        if (!input.identity) {
            throw new InvalidRequestError('Native identifier cannot be empty.')
        }

        // Always refesh a token before interacting with DocuSign eSgintaure app
        await this.docuSign.dsClient.refreshAccessToekn();

        // write to response stream
        res.send(await this.userAccountRead(input.identity));
    }

    /**
     * Aggregate user accounts.
     * 
     * @param {Response<StdAccountListOutput>} res - stream to write a response
     */
    async listAccounts(res: Response<StdAccountListOutput>): Promise<void> {
        let hasNextPage = true;

        // offset of the first result
        // start with 0th index
        let offset = 0;

        while (hasNextPage) {
            // Always refesh a token before interacting with DocuSign eSgintaure app
            await this.docuSign.dsClient.refreshAccessToekn();

            let opts = {
                // When set to true, users membership insformation is returned.
                additionalInfo: true,

                // The position within the total result set from which to start returning values.
                startPosition: offset,

                // The number of records to return or paginated limit.
                // Limit must be > 0 and <= 100
                count: 100,
            }

            let result;
            try {
                result = await this.docuSign.listUsers(this.accountId, opts)
            } catch (error) {
                this.convertToConnectorError(error);
            }

            if (!result) {
                throw new InvalidResponseError(`Found empty response for user read. Offset: ${opts.startPosition}`);
            }

            if ((result as any).errno && (result as any).code) {
                this.convertToConnectorError(result as any);
            }

            result = result as UserInformationList;

            // next index position to fetch user records
            if (result.endPosition) {
                offset = parseInt(result.endPosition) + 1;
            }

            if (parseInt(result.endPosition!) == parseInt(result.totalSetSize!) - 1) {
                hasNextPage = false;
            }

            // Write user records to response stream
            result.users?.map(async (user: UserInformation) => {
                res.send({
                    identity: user.userName,
                    uuid: user.userId,
                    attributes: {
                        userName: user.userName,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userType: user.userType,
                        uri: user.uri,
                        email: user.email,
                        company: user.company,
                        jobTitle: user.jobTitle,
                        isAdmin: user.isAdmin,
                        isNAREnabled: user.isNAREnabled,
                        userStatus: user.userStatus,
                        defaultAccountId: user.defaultAccountId,
                        createdDateTime: user.createdDateTime,
                        sendActivationOnInvalidLogin: user.sendActivationOnInvalidLogin,
                        enableConnectForUser: user.enableConnectForUser,
                        lastLogin: user.lastLogin,
                        groups: user.groupList?.map((group: Group) => group?.groupId)
                    }
                } as StdAccountListOutput)
            });
        } // loop end
    }

    /**
     * Aggregate entitlements.
     * 
     * @param {Response<StdEntitlementListOutput>} res - stream to write a response
     */
    async listEntitlements(res: Response<StdEntitlementListOutput>): Promise<void> {
        let hasNextPage = true;

        // offset of the first result
        // records start with 0th index
        let offset = 0;

        while (hasNextPage) {
            // Always refesh a token before interacting with DocuSign eSgintaure app
            await this.docuSign.dsClient.refreshAccessToekn();

            let opts = {
                // The position within the total result set from which to start returning values.
                startPosition: offset,

                // The number of records to return or paginated limit.
                // Limit must be > 0 and <= 100
                count: 100,
            }

            let result;
            try {
                result = await this.docuSign.listEntitlements(this.accountId, opts)
            } catch (error) {
                this.convertToConnectorError(error);
            }

            if (!result) {
                throw new InvalidResponseError(`Found empty response for group read. Offset: ${opts.startPosition}`);
            }

            if ((result as any).errno && (result as any).code) {
                this.convertToConnectorError(result as any);
            }

            result = result as GroupInformation;

            // next index position to fetch user records
            if (result.endPosition) {
                offset = parseInt(result.endPosition) + 1;
            }

            if (parseInt(result.endPosition!) == parseInt(result.totalSetSize!) - 1) {
                hasNextPage = false;
            }

            // write each entitlement to the response stream
            result.groups?.map(async (group: Group) => {
                res.send({
                    identity: group.groupName,
                    uuid: group.groupId,
                    attributes: {
                        groupName: group.groupName,
                        groupType: group.groupType,
                        permissionProfileId: group.permissionProfileId,
                        usersCount: group.usersCount
                    }
                } as StdEntitlementListOutput)
            });
        } // loop end
    }

    /**
     * Update an account for entitlements and attributes.
     * 
     * @param {StdAccountUpdateInput} plan - attribute changes
     * @param {Response<StdAccountUpdateOutput>} res - stream to write a response.
     */
    async updateAccount(plan: StdAccountUpdateInput,
        res: Response<StdAccountUpdateOutput>): Promise<void> {

        if (!plan.identity) {
            throw new InvalidRequestError('Native identifier cannot be empty.')
        }

        // Always refesh a token before interacting with DocuSign eSgintaure app
        await this.docuSign.dsClient.refreshAccessToekn();

        const userId = plan.identity;
        const entitlmentsUpdates = plan.changes.filter((item) => (item.attribute == 'group' && (item.op == 'Add' || item.op == 'Remove')));
        const attrUpdates = plan.changes.filter((item) => (item.attribute != 'group'));

        // Entitlement updates
        let entUpdateErrors: any[] = [];
        let entUpdateUserErrors: any[] = [];
        let entUpdateWireErrors: any[] = [];
        let numOfEntUpdateErrors = 0;
        if (entitlmentsUpdates.length > 0) {
            await
                Promise.all(
                    entitlmentsUpdates.map(async (item: AttributeChange) => {
                        // Add user to group
                        if (item.op == 'Add') {
                            return await
                                this.docuSign
                                    .updateGroupUsers(this.accountId, item.value, { userInfoList: { users: [{ userId: userId }] } })
                                    .catch((error) => error);
                        }

                        // Remove user from group
                        return await
                            this.docuSign
                                .deleteGroupUsers(this.accountId, item.value, { userInfoList: { users: [{ userId: userId }] } })
                                .catch((error) => error);
                    }))
                    .then((resList) => {
                        entUpdateErrors = resList.filter((res) => res instanceof Error);
                        entUpdateUserErrors = resList.filter((res) => (res.users?.length && res.users[0].errorDetails));
                        entUpdateWireErrors = resList.filter((res) => (res.code && res.errno));
                    });

            numOfEntUpdateErrors = entUpdateErrors.length + entUpdateUserErrors.length + entUpdateWireErrors.length;
        }

        // Account attribute updates
        let numOfattrUpdateErrors = 0;
        if (attrUpdates.length > 0) {
            let userAttrJson: any = {};
            attrUpdates.forEach((item: AttributeChange, index: number) => {
                userAttrJson[item.attribute] = item.value;
            });

            var attrUpdateRes = await
                this.docuSign
                    .updateUser(this.accountId, userId, { userInformation: userAttrJson })
                    .catch((error) => error);

            if (attrUpdateRes instanceof Error ||
                (attrUpdateRes.users?.length && attrUpdateRes.users[0].errorDetails) ||
                (attrUpdateRes.code && attrUpdateRes.errno)) {
                numOfattrUpdateErrors++;
            }
        }

        // errors and responses
        if (entitlmentsUpdates.length > 0 && attrUpdates.length == 0) { // if rquest only for entitlemnt updates
            if (numOfEntUpdateErrors == entitlmentsUpdates.length) {
                throw new ConnectorError(`All entitlement updates to the account [${userId}] are failed.`);
            } else if (numOfEntUpdateErrors < entitlmentsUpdates.length) {
                console.warn(`Some entitlement updates failed for the account [${userId}]`);
            }

            // write to a response stream
            res.send(await this.userAccountRead(userId) as StdAccountUpdateOutput);
        } else if (entitlmentsUpdates.length == 0 && attrUpdates.length > 0) { // if request only for attribute updates
            if (numOfattrUpdateErrors > 0) {
                console.error(`Attribute updates to the account [${userId}] are failed.`);
                this.convertToConnectorError(attrUpdateRes);
            }

            // write to a response stream
            res.send(await this.userAccountRead(userId) as StdAccountUpdateOutput);
        } else if (entitlmentsUpdates.length > 0 && attrUpdates.length > 0) { // if mixed request
            if (numOfattrUpdateErrors == 0 && numOfEntUpdateErrors > 0) {
                console.warn(`Entitlement updates to the account [${userId}] are failed.`);
                res.send(await this.userAccountRead(userId) as StdAccountUpdateOutput);
            } else if (numOfattrUpdateErrors > 0 && numOfEntUpdateErrors == 0) {
                console.warn(`Attribute updates to the account [${userId}] are failed.`);
                res.send(await this.userAccountRead(userId) as StdAccountUpdateOutput);
            } else if (numOfattrUpdateErrors > 0 && numOfEntUpdateErrors > 0) {
                if (numOfEntUpdateErrors == entitlmentsUpdates.length && numOfattrUpdateErrors == 1) {
                    throw new ConnectorError(`All updates to the account [${userId}] are failed.`);
                }
                console.warn(`Some updates to the account [${userId}] are failed.`);
                res.send(await this.userAccountRead(userId) as StdAccountUpdateOutput);
            } else if (numOfattrUpdateErrors == 0 && numOfEntUpdateErrors == 0) {
                // full success
                res.send(await this.userAccountRead(userId) as StdAccountUpdateOutput);
            }
        }
    }

    /**
     * Create a new user account.
     * 
     * @param {StdAccountCreateInput} input - New user definition.
     * @param {Response<StdAccountCreateOutput>} res - stream to write a response.
     */
    async crateAccount(input: StdAccountCreateInput,
        res: Response<StdAccountCreateOutput>): Promise<void> {
            if (!input.identity) {
                throw new InvalidRequestError('Username cannot be empty.')
            }
            
            // Form the JSON payload
            let userAttrs: any= {};
            for (let key in input.attributes) {
                userAttrs[key] = input.attributes[key];
            }
            userAttrs['userName'] = input.identity;
            let users = [];
            users.push(userAttrs);

            // Always refesh a token before interacting with DocuSign eSgintaure app
            await this.docuSign.dsClient.refreshAccessToekn();

            let result;
            try {
                result = await this.docuSign.createUser(this.accountId, { newUsersDefinition: { newUsers: users } } );
            } catch (error) {
                this.convertToConnectorError(error);
            }
    
            if (!result) {
                throw new InvalidResponseError('Found empty response for user creation.');
            }
    
            if ((result as any).errno && (result as any).code) {
                this.convertToConnectorError(result as any);
            }

            if (result.newUsers && result.newUsers.length > 0 && result.newUsers[0].userId) {
                // send back a new user 
                res.send(await this.userAccountRead(result.newUsers[0].userId) as StdAccountCreateOutput);
            } else {
                // convey an error for safer side
                throw new ConnectorError('User creation failed.');
            }        
    }

    /**
     * Removes users account privileges.
     * This closes one or more user records in the account. Users are never deleted
     * from an account, but closing a user prevents them from using account functions.
     * 
     * @param {StdAccountDeleteInput} input - Native identifier to delete.
     * @param {Response<StdAccountDeleteOutput>} res - stream to write a response.
     */
    async deleteAccount(input: StdAccountDeleteInput,
        res: Response<StdAccountDeleteOutput>): Promise<void> {

        if (!input.identity) {
            throw new InvalidRequestError('Native identifier cannot be empty.')
        }

        // Always refesh a token before interacting with DocuSign eSgintaure app
        await this.docuSign.dsClient.refreshAccessToekn();

        let result;
        try {
            result = await this.docuSign.deleteUser(this.accountId, { userInfoList: { users: [{ userId: input.identity }] } });
        } catch (error) {
            this.convertToConnectorError(error);
        }

        if (!result) {
            throw new InvalidResponseError('Found empty response for user deletion.');
        }

        if ((result as any).errno && (result as any).code) {
            this.convertToConnectorError(result as any);
        }

        // Add empty response to convey success
        res.send({});
    }

    /**
     * Read a user.
     * 
     * @param {string} userId - native identifier
     * @returns {StdAccountReadOutput} user - user account resource object.
     */
    private async userAccountRead(userId: string): Promise<StdAccountReadOutput> {

        let result;
        try {
            result = await this.docuSign.getUser(this.accountId, userId);
        } catch (error) {
            this.convertToConnectorError(error);
        }

        if (!result) {
            throw new InvalidResponseError('Found empty response for user read.');
        }

        if ((result as any).errno && (result as any).code) {
            this.convertToConnectorError(result as any);
        }

        result = result as UserInformation;
        let userAccount = {
            identity: result.userName,
            uuid: result.userId,
            attributes: {
                userName: result.userName,
                firstName: result.firstName,
                lastName: result.lastName,
                userType: result.userType,
                uri: result.uri,
                email: result.email,
                company: result.company,
                jobTitle: result.jobTitle,
                isAdmin: result.isAdmin,
                isNAREnabled: result.isNAREnabled,
                userStatus: result.userStatus,
                defaultAccountId: result.defaultAccountId,
                createdDateTime: result.createdDateTime,
                sendActivationOnInvalidLogin: result.sendActivationOnInvalidLogin,
                enableConnectForUser: result.enableConnectForUser,
                lastLogin: result.lastLogin,
                groups: result.groupList?.map((group: Group) => group?.groupId)
            }
        } as StdAccountReadOutput;

        return userAccount;
    }

    /**
     * Validate source configurations.
     * 
     * @param {any} config - Source ccnfiguration to validate
     */
    private validateConfiguration(config: any): void {
        if (!config?.apiUrl) {
            throw new InvalidConfigurationError(`'apiUrl' is required`)
        } else if (!config?.oauthServerUrl) {
            throw new InvalidConfigurationError(`'oauthServerUrl' is required`)
        } else if (!config?.accountId) {
            throw new InvalidConfigurationError(`'accountId' is required`)
        } else if (!config?.clientId) {
            throw new InvalidConfigurationError(`'clientId' is required`)
        } else if (!config?.clientSecret) {
            throw new InvalidConfigurationError(`'clientSecret' is required`)
        } else if (!config?.refreshToken) {
            throw new InvalidConfigurationError(`'refreshToken' is required`)
        }
    }

    /**
     * Convert error to an appropriate ConnectorError.
     * 
     * @param {Error | any} err - An error object.
     */
    private convertToConnectorError(err: Error | any): void {
        if (err instanceof Error) { // http errors
            let e = err as ResponseError;
            if (e.status) {
                if (e.status == 400) {
                    throw new InvalidRequestError(`${e.status} ${e.message}`, e);
                } if (e.status == 401) {
                    throw new InvalidConfigurationError(`${e.status} ${e.message}`, e);
                } else if (e.status == 403) {
                    throw new InsufficientPermissionError(`${e.status} ${e.message}`, e);
                } else if (e.status == 404) {
                    throw new InvalidRequestError(`${e.status} ${e.message}`, e);
                } else {
                    throw new ConnectorError(`${e.status} ${e.message}`, e);
                }
            } else {
                throw new ConnectorError(`${e.message}`, e);
            }
        } else if (err.code) {  // wire errors
            if (err.code === 'ENOTFOUND') {
                throw new InvalidConfigurationError(`Unkonwn host. message: ${err.message} , errno: ${err.errno} , code: ${err.code}`, err);
            }
        } else {
            throw new ConnectorError(err);
        }
    }
}
