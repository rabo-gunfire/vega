/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import * as dsclient from "../src/docusign/dsclient";
import * as docusign from "../src/docusign/docusign";
import {
    GroupInformation,
    NewUsersSummary,
    UserInformation,
    UserInformationList,
    UsersResponse,
} from "docusign-esign";

//////////////////////////////////////////////////////////////////////
//
// UsersApi mocks
//
//////////////////////////////////////////////////////////////////////

const mockGetInformation = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        userId: "34bade63-d863-4d12-a40d-5acd5a11fed0",
        userName: "fake.user",
        email: "fake.user@fakemail.com"
    } as UserInformation);
});

const mockList = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        users: [{
            userId: "34bade63-d863-4d12-a40d-5acd5a11fed0",
            userName: "fake-1.user",
            email: "fake-1.user@fakemail.com"
        },
        {
            userId: "45bade63-d863-4d12-a40d-5acd5a11fet7",
            userName: "fake-2.user",
            email: "fake-2.user@fakemail.com"
        }],
        endPosition: "1",
        resultSetSize: "2",
        startPosition: "0",
        totalSetSize: "2",
    } as UserInformationList);
});

const mockCreate = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        newUsers: [
            {
                createdDateTime: "2021-07-24T14:05:26.7930000Z",
                email: "fake-3.user@fakemail.com",
                uri: "/users/91f04aed-c9fc-4803-a314-02a5fa48ada9",
                userId: "91f04aed-c9fc-4803-a314-02a5fa48ada9",
                userName: "fake-3.user",
                userStatus: "ActivationSent",
            }
        ]
    } as NewUsersSummary);
});

const mockUpdateUser = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        company: "FOO",
        createdDateTime: "0001-01-01T08:00:00.0000000Z",
        email: "fake-3.user@fakemail.com",
        jobTitle: "PSE",
        uri: "/users/91f04aed-c9fc-4803-a314-02a5fa48ada9",
        userAddedToAccountDateTime: "0001-01-01T08:00:00.0000000Z",
        userId: "91f04aed-c9fc-4803-a314-02a5fa48ada9",
    } as UserInformation);
});

const mockDel = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        users: [
            {
                uri: "/users/542892d7-4033-4563-90a0-c462c10eddcb",
                userId: "542892d7-4033-4563-90a0-c462c10eddcb",
                userStatus: "closed",
            }
        ]
    } as UsersResponse);
});

/* Mock docusign-esign UsersApi */
jest.mock("docusign-esign/src/api/UsersApi", () => {
    return jest.fn().mockImplementation(() => ({
        getInformation: mockGetInformation,
        list: mockList,
        create: mockCreate,
        updateUser: mockUpdateUser,
        _delete: mockDel,
    }));
});

//////////////////////////////////////////////////////////////////////
//
// GroupApi mocks
//
//////////////////////////////////////////////////////////////////////

const mockUpdateGroupUsers = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        users: [
            {
                uri: "/users/91f04aed-c9fc-4803-a314-02a5fa48ada9",
                userId: "91f04aed-c9fc-4803-a314-02a5fa48ada9",
                userName: "fake-3.user",
                userStatus: "created",
                userType: "companyuser"
            }
        ]
    } as UsersResponse);
});

const mockDeleteGroupUsers = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        users: [
            {
                uri: "/users/91f04aed-c9fc-4803-a314-02a5fa48ada9",
                userId: "91f04aed-c9fc-4803-a314-02a5fa48ada9",
                userName: "fake-3.user",
                userStatus: "created",
                userType: "companyuser"
            }
        ]
    } as UsersResponse);
});

const mockListGroups = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        groups: [
            {
                groupId: "8265839",
                groupName: "Administrators",
                groupType: "adminGroup",
                permissionProfileId: "11666297",
                usersCount: "2",
            },
            {
                groupId: "8265840",
                groupName: "Everyone",
                groupType: "everyoneGroup",
                usersCount: "9",
            },
            {
                groupId: "8267667",
                groupName: "Financ",
                groupType: "customGroup",
                usersCount: "1",
            },
            {
                groupId: "8275323",
                groupName: "View User Group",
                groupType: "customGroup",
                permissionProfileId: "11679476",
                usersCount: "3",
            }
        ],
        endPosition: "3",
        resultSetSize: "4",
        startPosition: "0",
        totalSetSize: "4"
    } as GroupInformation);
});

/* Mock docusign-esign GroupsApi */
jest.mock("docusign-esign/src/api/GroupsApi", () => {
    return jest.fn().mockImplementation(() => ({
        listGroups: mockListGroups,
        updateGroupUsers: mockUpdateGroupUsers,
        deleteGroupUsers: mockDeleteGroupUsers
    }));
});

//////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////

describe("dsClient", () => {
    let inst: docusign.DocuSign;
    beforeEach(() => {
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access"));
    })

    test("[0] ds client to be defined", async () => {
        expect(inst.dsClient).toBeDefined();
    });
});

describe("getUser", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let userId = '34bade63-d863-4d12-a40d-5acd5a11fed0';

    beforeEach(() => {
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access"));
    });

    test("[o] get user", async () => {
        let result: any = await inst.getUser(accountId, userId);

        expect(mockGetInformation).toBeCalled();
        expect(mockGetInformation).toBeCalledTimes(1);
        expect(result.userId).toStrictEqual(userId);
    });
});

describe("listUsers", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';

    beforeEach(() => {
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access"));
    });

    test("[0] list users", async () => {
        let result = await inst.listUsers(accountId, {});

        expect(mockList).toBeCalled();
        expect(mockList).toBeCalledTimes(1);
        expect(result.totalSetSize).toStrictEqual("2");
    });
});

describe("listEntitlements", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';

    beforeEach(() => {
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access"));
    });

    test("[0] list entitlements", async () => {
        let result = await inst.listEntitlements(accountId, {});

        expect(mockListGroups).toBeCalled();
        expect(mockListGroups).toBeCalledTimes(1);
        expect(result.totalSetSize).toStrictEqual("4");
    });
});

describe("createUser", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let userId = "91f04aed-c9fc-4803-a314-02a5fa48ada9";
    let userName = "fake-3.user";

    beforeEach(() => {
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access"));
    });

    test("[0] create user", async () => {
        let result: any = await inst.createUser(accountId, {});

        expect(mockCreate).toBeCalled();
        expect(mockCreate).toBeCalledTimes(1);
        expect(result.newUsers[0].userId).toStrictEqual(userId);
        expect(result.newUsers[0].userName).toStrictEqual(userName);
    });
});

describe("updateUser", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let userId = "91f04aed-c9fc-4803-a314-02a5fa48ada9";
    let company = "FOO";
    let jobTitle = "PSE";

    beforeEach(() => {
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access"));
    });

    test("[0] update user", async () => {
        let result = await inst.updateUser(accountId, userId, {});

        expect(mockUpdateUser).toBeCalled();
        expect(mockUpdateUser).toBeCalledTimes(1);
        expect(result.company).toStrictEqual(company);
        expect(result.jobTitle).toStrictEqual(jobTitle);
    });
});

describe("deleteUser", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let userId = '542892d7-4033-4563-90a0-c462c10eddcb';

    beforeEach(() => {
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access"));
    });

    test("[0] delete user", async () => {
        let result: any = await inst.deleteUser(accountId, userId);

        expect(mockDel).toBeCalled();
        expect(mockDel).toBeCalledTimes(1);
        expect(result.users[0].userId).toStrictEqual(userId);
        expect(result.users[0].userStatus).toStrictEqual("closed");
    });
});

describe("updateGroupUsers", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let groupId = '8267667';

    beforeEach(() => {
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access"));
    });

    test("[0] add user to group", async () => {
        let result:any = await inst.updateGroupUsers(accountId, groupId, {});

        expect(mockUpdateGroupUsers).toBeCalled();
        expect(mockUpdateGroupUsers).toBeCalledTimes(1);
        expect(result.users[0].userId).toStrictEqual('91f04aed-c9fc-4803-a314-02a5fa48ada9');
    });
});

describe("deleteGroupUsers", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let groupId = '8267667';

    beforeEach(() => {
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access"));
    });

    test("[0] remove user from group", async () => {
        let result:any = await inst.deleteGroupUsers(accountId, groupId, {});

        expect(mockDeleteGroupUsers).toBeCalled();
        expect(mockDeleteGroupUsers).toBeCalledTimes(1);
        expect(result.users[0].userId).toStrictEqual('91f04aed-c9fc-4803-a314-02a5fa48ada9');
    });
});
