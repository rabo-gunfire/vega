/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { Group, GroupInformation, UserInformation, UserInformationList } from 'docusign-esign';

import {
    AttributeChange,
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
    StdEntitlementReadOutput,
    StdTestConnectionOutput
} from '@sailpoint/connector-sdk';

import { DocuSignClient } from '../docusign/dsclient';
import { DocuSign } from '../docusign/docusign';
import { ConnectorError } from './connector-error';
import { InvalidRequestError } from './invalid-request-error';
import { InvalidResponseError } from './invalid-response-error';
import { DseConfig } from './dse-config';
import { logger } from '../tools/logger';
import { convertToConnectorError } from '../tools/error-converter';

/**
 * DocuSign eSignature connector
 */
export class DseConnector {
    private docuSign: DocuSign;
    private accountId: string;

    private groupAttr = 'groups';

    /**
     * Constructor to initialize DocuSign client.
     *
     * @param {DseConfig} config - Source configuration
     */
    constructor(config: DseConfig) {
        this.docuSign = new DocuSign(
            new DocuSignClient(config.apiUrl, config.clientId, config.userId, config.privateKey)
        );

        this.accountId = config.accountId;
    }

    /**
     * Connection check with DocuSign application.
     *
     * @param {Response<StdTestConnectionOutput>} res - stream to write a response
     */
    async testConnection(res: Response<StdTestConnectionOutput>): Promise<void> {
        // Decode an access token and find a subject
        let result;
        try {
            result = await this.docuSign.getTokenUserInfo();
        } catch (error) {
            convertToConnectorError(error);
        }

        if (!result) {
            throw new InvalidResponseError('Found empty response for token decode.');
        }

        // Load user associated with a token
        let user;
        try {
            user = await this.docuSign.getUser(this.accountId, result.sub);
        } catch (error) {
            convertToConnectorError(error);
        }

        if (!user) {
            throw new InvalidResponseError('Found empty response for user read.');
        }

        // success
        res.send({} as StdTestConnectionOutput);
    }

    /**
     * Reads user account.
     *
     * @param {StdAccountReadInput} input - native identifier information
     * @param {Response<StdAccountReadOutput>} res - stream to write a response
     */
    async readAccount(input: StdAccountReadInput, res: Response<StdAccountReadOutput>): Promise<void> {
        if (!input.identity) {
            throw new InvalidRequestError('Native identifier cannot be empty.');
        }

        // write to response stream
        res.send(await this.userAccountRead(input.identity));
    }

    /**
     * Aggregate user accounts.
     *
     * @param {Response<StdAccountListOutput>} res - stream to write a response
     */
    async listAccounts(res: Response<StdAccountListOutput>): Promise<void> {
        let hasNextPage = true,
            accountCount = 0,
            offset = 0; // offset of the first record starts with 0th index
        const resPromises: Promise<void>[] = [];

        while (hasNextPage) {
            const opts = {
                // When set to true, users membership information is returned.
                additionalInfo: true,

                // The position within the total result set from which to start returning values.
                startPosition: offset,

                // The number of records to return or paginated limit.
                // Limit must be > 0 and <= 100
                count: 100
            };

            let result;
            try {
                result = await this.docuSign.listUsers(this.accountId, opts);
            } catch (error) {
                convertToConnectorError(error);
            }

            if (!result) {
                throw new InvalidResponseError(`Found empty response for user read. Offset: ${opts.startPosition}`);
            }

            result = result as UserInformationList;

            // next index position to fetch user records
            if (result.endPosition) {
                offset = parseInt(result.endPosition) + 1;
            }

            if (parseInt(result.endPosition!) == parseInt(result.totalSetSize!) - 1) {
                hasNextPage = false;
            }

            // Write user records asynchronously to the response stream
            resPromises.push(
                ...result.users!.map(async (user: UserInformation) => {
                    res.send(this.constructUserRO(user) as StdAccountListOutput);

                    accountCount++;
                })
            );
        } // loop end

        await Promise.all(resPromises);

        logger.info(`DocuSign eSignature connector stdAccountListHandler sent ${accountCount} accounts.`);
    }

    /**
     * Aggregate entitlements.
     *
     * @param {Response<StdEntitlementListOutput>} res - stream to write a response
     */
    async listEntitlements(res: Response<StdEntitlementListOutput>): Promise<void> {
        let hasNextPage = true,
            entitlementCount = 0,
            offset = 0; // offset of the first record starts with 0th index
        const resPromises: Promise<void>[] = [];

        while (hasNextPage) {
            const opts = {
                // The position within the total result set from which to start returning values.
                startPosition: offset,

                // The number of records to return or paginated limit.
                // Limit must be > 0 and <= 100
                count: 100
            };

            let result;
            try {
                result = await this.docuSign.listEntitlements(this.accountId, opts);
            } catch (error) {
                convertToConnectorError(error);
            }

            if (!result) {
                throw new InvalidResponseError(`Found empty response for group read. Offset: ${opts.startPosition}`);
            }

            result = result as GroupInformation;

            // next index position to fetch user records
            if (result.endPosition) {
                offset = parseInt(result.endPosition) + 1;
            }

            if (parseInt(result.endPosition!) == parseInt(result.totalSetSize!) - 1) {
                hasNextPage = false;
            }

            // write group entitlements asynchronously to the response stream
            resPromises.push(
                ...result.groups!.map(async (group: Group) => {
                    res.send(this.constructEntitlementRO(group) as StdEntitlementListOutput);

                    entitlementCount++;
                })
            );
        } // loop end

        await Promise.all(resPromises);

        logger.info(`DocuSign eSignature connector stdEntitlementListHandler sent ${entitlementCount} entitlements.`);
    }

    /**
     * Create a new user account.
     *
     * @param {StdAccountCreateInput} input - New user definition.
     * @param {Response<StdAccountCreateOutput>} res - stream to write a response.
     */
    async createAccount(input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>): Promise<void> {
        // Ignore input.identity, it is empty for this connector

        // Lets separate entitlement and attribute updates
        const userAttrs: any = {};
        let entitlements: string[] = [];
        for (const key in input.attributes) {
            if (key == this.groupAttr) {
                if (input.attributes[key] instanceof Array) {
                    entitlements = input.attributes[key];
                } else {
                    entitlements.push(input.attributes[key]);
                }
            } else {
                userAttrs[key] = input.attributes[key];
            }
        }

        // Attribute update payload
        const users = [];
        users.push(userAttrs);

        let result;
        try {
            result = await this.docuSign.createUser(this.accountId, { newUsersDefinition: { newUsers: users } });
        } catch (error) {
            convertToConnectorError(error);
        }

        if (!result) {
            throw new InvalidResponseError('Found empty response for user creation.');
        }

        if (result.newUsers && result.newUsers.length > 0 && result.newUsers[0].errorDetails) {
            throw new InvalidRequestError(
                result.newUsers[0].errorDetails.errorCode + ' - ' + result.newUsers[0].errorDetails.message
            );
        }

        let userId = '';
        if (result.newUsers && result.newUsers.length > 0 && result.newUsers[0].userId) {
            userId = result.newUsers[0].userId as string;
        }

        // Entitlement updates, if any
        let entUpdateErrors: any[] = [];
        let entUpdateUserErrors: any[] = [];
        let entUpdateWireErrors: any[] = [];
        let numOfEntUpdateErrors = 0;
        if (entitlements.length > 0 && userId) {
            await Promise.all(
                entitlements.map(async (group: string) => {
                    return await this.docuSign
                        .updateGroupUsers(this.accountId, group, { userInfoList: { users: [{ userId: userId }] } })
                        .catch(error => error);
                })
            ).then(resList => {
                entUpdateErrors = resList.filter(res => res instanceof Error);
                entUpdateUserErrors = resList.filter(res => res.users?.length && res.users[0].errorDetails);
                entUpdateWireErrors = resList.filter(res => res.code && res.errno);
            });

            numOfEntUpdateErrors = entUpdateErrors.length + entUpdateUserErrors.length + entUpdateWireErrors.length;
        }

        if (userId) {
            if (numOfEntUpdateErrors > 0) {
                if (numOfEntUpdateErrors == entitlements.length) {
                    logger.warn(`All entitlement updates failed for the account [${userId}]`);
                } else {
                    logger.warn(`Some entitlement updates failed for the account [${userId}]`);
                }
                entUpdateErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
                entUpdateUserErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
                entUpdateWireErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
            }

            // send back a new user
            res.send((await this.userAccountRead(userId)) as StdAccountCreateOutput);
        } else {
            // safer side ..
            throw new ConnectorError('User creation failed.');
        }
    }

    /**
     * Update an account for entitlements and attributes.
     *
     * @param {StdAccountUpdateInput} plan - attribute changes
     * @param {Response<StdAccountUpdateOutput>} res - stream to write a response.
     */
    async updateAccount(plan: StdAccountUpdateInput, res: Response<StdAccountUpdateOutput>): Promise<void> {
        if (!plan.identity) {
            throw new InvalidRequestError('Native identifier cannot be empty.');
        }

        const userId = plan.identity;
        const entitlementsUpdates = plan.changes.filter(item => item.attribute == this.groupAttr);
        const attrUpdates = plan.changes.filter(item => item.attribute != this.groupAttr);

        // Entitlement updates
        let entUpdateErrors: any[] = [];
        let entUpdateUserErrors: any[] = [];
        let entUpdateWireErrors: any[] = [];
        let numOfEntUpdateErrors = 0;
        if (entitlementsUpdates.length > 0) {
            await Promise.all(
                entitlementsUpdates.map(async (item: AttributeChange) => {
                    // Add user to group
                    if (item.op == 'Add') {
                        return await this.docuSign
                            .updateGroupUsers(this.accountId, item.value, {
                                userInfoList: { users: [{ userId: userId }] }
                            })
                            .catch(error => error);
                    }

                    // Remove user from group
                    return await this.docuSign
                        .deleteGroupUsers(this.accountId, item.value, { userInfoList: { users: [{ userId: userId }] } })
                        .catch(error => error);
                })
            ).then(resList => {
                entUpdateErrors = resList.filter(res => res instanceof Error);
                entUpdateUserErrors = resList.filter(res => res.users?.length && res.users[0].errorDetails);
                entUpdateWireErrors = resList.filter(res => res.code && res.errno);
            });

            numOfEntUpdateErrors = entUpdateErrors.length + entUpdateUserErrors.length + entUpdateWireErrors.length;
        }

        // Account attribute updates
        let numOfAttrUpdateErrors = 0;
        let attrUpdateRes;
        if (attrUpdates.length > 0) {
            const userAttrJson: any = {};
            attrUpdates.forEach((item: AttributeChange, index: number) => {
                userAttrJson[item.attribute] = item.value;
            });

            attrUpdateRes = await this.docuSign
                .updateUser(this.accountId, userId, { userInformation: userAttrJson })
                .catch(error => error);

            if (attrUpdateRes instanceof Error || (attrUpdateRes.code && attrUpdateRes.errno)) {
                numOfAttrUpdateErrors++;
            }
        }

        // errors and responses
        if (entitlementsUpdates.length > 0 && attrUpdates.length == 0) {
            // if request only for entitlement updates
            if (numOfEntUpdateErrors == entitlementsUpdates.length) {
                throw new ConnectorError(`All entitlement updates to the account [${userId}] are failed.`);
            } else if (numOfEntUpdateErrors > 0 && numOfEntUpdateErrors < entitlementsUpdates.length) {
                logger.warn(`Some entitlement updates failed for the account [${userId}]`);
                entUpdateErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
                entUpdateUserErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
                entUpdateWireErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
            }

            res.send((await this.userAccountRead(userId)) as StdAccountUpdateOutput);
        } else if (entitlementsUpdates.length == 0 && attrUpdates.length > 0) {
            // if request only for attribute updates
            if (numOfAttrUpdateErrors > 0) {
                logger.error(`Attribute updates to the account [${userId}] are failed.`);
                convertToConnectorError(attrUpdateRes);
            }

            res.send((await this.userAccountRead(userId)) as StdAccountUpdateOutput);
        } else if (entitlementsUpdates.length > 0 && attrUpdates.length > 0) {
            // if mixed request
            if (numOfAttrUpdateErrors == 0 && numOfEntUpdateErrors == 0) {
                res.send((await this.userAccountRead(userId)) as StdAccountUpdateOutput);
            } else if (numOfAttrUpdateErrors == 0 && numOfEntUpdateErrors > 0) {
                logger.warn(`Entitlement updates to the account [${userId}] are failed.`);
                entUpdateErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
                entUpdateUserErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
                entUpdateWireErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));

                res.send((await this.userAccountRead(userId)) as StdAccountUpdateOutput);
            } else if (numOfAttrUpdateErrors > 0 && numOfEntUpdateErrors == 0) {
                logger.warn(`Attribute updates to the account [${userId}] are failed.`);
                logger.warn(attrUpdateRes);

                res.send((await this.userAccountRead(userId)) as StdAccountUpdateOutput);
            } else if (numOfAttrUpdateErrors > 0 && numOfEntUpdateErrors > 0) {
                if (numOfEntUpdateErrors == entitlementsUpdates.length && numOfAttrUpdateErrors == 1) {
                    entUpdateErrors.forEach(error => logger.error({ cause: error }, 'Entitlement update failed.'));
                    entUpdateUserErrors.forEach(error => logger.error({ cause: error }, 'Entitlement update failed.'));
                    entUpdateWireErrors.forEach(error => logger.error({ cause: error }, 'Entitlement update failed.'));
                    logger.error(attrUpdateRes);

                    throw new ConnectorError(`All updates to the account [${userId}] are failed.`);
                }

                logger.warn(`Some updates to the account [${userId}] are failed.`);
                entUpdateErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
                entUpdateUserErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
                entUpdateWireErrors.forEach(error => logger.warn({ cause: error }, 'Entitlement update failed.'));
                logger.warn(attrUpdateRes);

                res.send((await this.userAccountRead(userId)) as StdAccountUpdateOutput);
            }
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
    async deleteAccount(input: StdAccountDeleteInput, res: Response<StdAccountDeleteOutput>): Promise<void> {
        if (!input.identity) {
            throw new InvalidRequestError('Native identifier cannot be empty.');
        }

        let result;
        try {
            result = await this.docuSign.deleteUser(this.accountId, {
                userInfoList: { users: [{ userId: input.identity }] }
            });
        } catch (error) {
            convertToConnectorError(error);
        }

        if (!result) {
            throw new InvalidResponseError('Found empty response for user deletion.');
        }

        // Add empty response to convey success
        res.send({} as StdAccountDeleteOutput);
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
            convertToConnectorError(error);
        }

        if (!result) {
            throw new InvalidResponseError('Found empty response for user read.');
        }

        return this.constructUserRO(result);
    }

    /**
     * Builds user resource object(RO) that will be sent back
     * to governance platform.
     *
     * @param {UserInformation} user - user stub
     * @returns {StdAccountReadOutput} - resource object (ro)
     */
    private constructUserRO(user: UserInformation): StdAccountReadOutput {
        const ro = {
            identity: user.userId,
            uuid: user.userId,
            attributes: {
                userName: user.userName,
                userId: user.userId,
                userType: user.userType,
                isAdmin: user.isAdmin,
                isNAREnabled: user.isNAREnabled,
                userStatus: user.userStatus,
                uri: user.uri,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                jobTitle: user.jobTitle,
                company: user.company,
                permissionProfileId: user.permissionProfileId,
                permissionProfileName: user.permissionProfileName,
                sendActivationOnInvalidLogin: user.sendActivationOnInvalidLogin,
                enableConnectForUser: user.enableConnectForUser,
                groups: user.groupList?.map((group: Group) => group?.groupId) as string[],
                defaultAccountId: user.defaultAccountId,
                createdDateTime: user.createdDateTime,
                lastLogin: user.lastLogin
            }
        } as StdAccountReadOutput;

        return ro;
    }

    /**
     * Builds entitlement resource object(RO) that will be sent back
     * to governance platform.
     *
     * @param {Group} group - group stub
     * @returns {StdEntitlementReadOutput} - resource object (ro)
     */
    private constructEntitlementRO(group: Group): StdEntitlementReadOutput {
        const ro = {
            identity: group.groupId,
            uuid: group.groupId,
            attributes: {
                groupId: group.groupId,
                groupName: group.groupName,
                groupType: group.groupType,
                permissionProfileId: group.permissionProfileId,
                usersCount: group.usersCount
            }
        } as StdEntitlementReadOutput;

        return ro;
    }
}
