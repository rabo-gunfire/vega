/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import {
    GroupsApi,
    NewUsersSummary,
    UserInformation,
    UserInformationList,
    UsersApi,
    UsersResponse
} from "docusign-esign";
import { DocuSignClient } from "./dsclient";
import { executeRequestThrottleOn } from "./request-throttler";

export class DocuSign {
    /**
     * DocuSign eSignature client SDK wrapper
     */
    private dseClient: DocuSignClient;

    /**
     * Constructor to initialize DocuSign API client.
     *
     * @param {DocuSignClient} dsClient - dse API client
     */
    constructor(dseClient: DocuSignClient) {
        this.dseClient = dseClient;
    }

    /**
     * Get the native docusign API client.
     */
    get dsClient(): DocuSignClient {
        return this.dseClient;
    }

    async getTokenUserInfo(): Promise<any> {
        // Always refresh a token before interacting with DocuSign eSgintaure app
        await this.dsClient.refreshAccessToken();

        return this.dsClient.getTokenUserInfo();
    }

    /**
     * Gets the user information for a specified user.
     *
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @param {string} userId - The user ID of the user being accessed.
     * @returns {UserInformation} A user details.
     */
    async getUser(accountId: string, userId: string): Promise<UserInformation> {
        // Always refresh a token before interacting with DocuSign eSgintaure app
        await this.dsClient.refreshAccessToken();

        const usersApi = new UsersApi(this.dsClient.dsApiClient);
        return executeRequestThrottleOn(usersApi.getInformation, usersApi, [accountId, userId]);
    }

    /**
     * Retrieves the list of users for the specified account.
     *
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @returns {UserInformationList} List of users.
     */
    async listUsers(accountId: string, opts: any): Promise<UserInformationList> {
        // Always refresh a token before interacting with DocuSign eSgintaure app
        await this.dsClient.refreshAccessToken();

        const usersApi = new UsersApi(this.dsClient.dsApiClient);
        return executeRequestThrottleOn(usersApi.list, usersApi, [accountId, opts]);
    }

    /**
     * Retrieves the list of users for the specified account.
     * 
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @returns {UserInformationList} List of users.
     */
    async listEntitlements(accountId: string, opts: any): Promise<UserInformationList> {
        // Always refresh a token before interacting with DocuSign eSgintaure app
        await this.dsClient.refreshAccessToken();

        const groupsApi = new GroupsApi(this.dsClient.dsApiClient);
        return executeRequestThrottleOn(groupsApi.listGroups, groupsApi, [accountId, opts]);
    }

    /**
     * Adds one or more users to an existing group.
     * 
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @param {string} groupId - The ID of the group being accessed.
     * @param {any} body - A user info list to add.
     * @returns {UsersResponse} - A user response object.
     */
    async updateGroupUsers(accountId: string, groupId: string, body: any): Promise<UsersResponse> {
        // Always refresh a token before interacting with DocuSign eSgintaure app
        await this.dsClient.refreshAccessToken();

        const groupsApi = new GroupsApi(this.dsClient.dsApiClient);
        return executeRequestThrottleOn(groupsApi.updateGroupUsers, groupsApi, [accountId, groupId, body]);
    }

    /**
     * Deletes one or more users from a group.
     * 
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @param {string} groupId - The ID of the group being accessed.
     * @param {any} body - A user info list to add.
     * @returns {UsersResponse} - A user response object.
     */
    async deleteGroupUsers(accountId: string, groupId: string, body: any): Promise<UsersResponse> {
        // Always refresh a token before interacting with DocuSign eSgintaure app
        await this.dsClient.refreshAccessToken();

        const groupsApi = new GroupsApi(this.dsClient.dsApiClient);
        return executeRequestThrottleOn(groupsApi.deleteGroupUsers, groupsApi, [accountId, groupId, body]);
    }

    /**
     * Deletes one or more users from a group.
     * 
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @param {string} userId - The user ID of the user being accessed.
     * @param {any} body - A list of attribute changes.
     * @returns {UserInformation} - A user information object.
     */
    async updateUser(accountId: string, userId: string, body: any): Promise<UserInformation> {
        // Always refresh a token before interacting with DocuSign eSgintaure app
        await this.dsClient.refreshAccessToken();

        const usersApi = new UsersApi(this.dsClient.dsApiClient);
        return executeRequestThrottleOn(usersApi.updateUser, usersApi, [accountId, userId, body]);
    }

    /**
     * Adds new user to the specified account.
     * 
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @param {any} body - A new user definition.
     * @returns {NewUsersSummary} - New user summary object.
     */
    async createUser(accountId: string, body: any): Promise<NewUsersSummary> {
        // Always refresh a token before interacting with DocuSign eSgintaure app
        await this.dsClient.refreshAccessToken();

        const usersApi = new UsersApi(this.dsClient.dsApiClient);
        return executeRequestThrottleOn(usersApi.create, usersApi, [accountId, body]);
    }

    /**
     * Removes users account privileges.
     * This closes one or more user records in the account. Users are never deleted
     * from an account, but closing a user prevents them from using account functions.

     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @param {any} body - Containing ID of the user to delete. 
     * @returns {UsersResponse} - A user information object.
     */
    async deleteUser(accountId: string, body: any): Promise<UsersResponse> {
        // Always refresh a token before interacting with DocuSign eSgintaure app
        await this.dsClient.refreshAccessToken();

        const usersApi = new UsersApi(this.dsClient.dsApiClient);
        return executeRequestThrottleOn(usersApi._delete, usersApi, [accountId, body]);
    }
}
