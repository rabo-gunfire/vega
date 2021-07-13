/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import {
    ApiClient,
    GroupsApi,
    NewUsersSummary,
    UserInformation,
    UserInformationList,
    UsersApi,
    UsersResponse
} from "docusign-esign";
import { DocuSignClient } from "./dsclient";

export class DocuSign {

    private apiClient: DocuSignClient;

    /**
     * Constructor to initialize DocuSign API client.
     * 
     * @param {DocuSignClient} dsClient - dse API client
     */
    constructor(dsClient: DocuSignClient) {
        this.apiClient = dsClient;
    }

    /**
     * Get the docusign API client.
     */
    get dsClient(): DocuSignClient {
        return this.apiClient;
    }

    /**
     * Gets the user information for a specified user.
     * 
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @param {string} userId - The user ID of the user being accessed.
     * @returns {UserInformation} A user details.
     */
    async getUser(accountId: string, userId: string): Promise<UserInformation> {
        return new UsersApi(this.apiClient.dsApiClient).getInformation(accountId, userId);
    }

    /**
     * Retrieves the list of users for the specified account.
     *
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @returns {UserInformationList} List of users.
     */
    async listUsers(accountId: string, opts: any): Promise<UserInformationList> {
        return new UsersApi(this.apiClient.dsApiClient).list(accountId, opts);
    }

    /**
     * Retrieves the list of users for the specified account.
     * 
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @returns {UserInformationList} List of users.
     */
    async listEntitlements(accountId: string, opts: any): Promise<UserInformationList> {
        return new GroupsApi(this.apiClient.dsApiClient).listGroups(accountId, opts);
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
        return new GroupsApi(this.apiClient.dsApiClient).updateGroupUsers(accountId, groupId, body);
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
        return new GroupsApi(this.apiClient.dsApiClient).deleteGroupUsers(accountId, groupId, body);
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
        return new UsersApi(this.apiClient.dsApiClient).updateUser(accountId, userId, body);
    }

    /**
     * Adds new user to the specified account.
     * 
     * @param {string} accountId - The external account number (int) or account ID Guid.
     * @param {any} body - A new user definition.
     * @returns {NewUsersSummary} - New user summary object.
     */
    async createUser(accountId: string, body: any): Promise<NewUsersSummary> {
        return new UsersApi(this.apiClient.dsApiClient).create(accountId, body);
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
        return new UsersApi(this.apiClient.dsApiClient)._delete(accountId, body);
    }
}
