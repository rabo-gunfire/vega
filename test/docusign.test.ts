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
import { executeRequestThrottleOn } from "../src/docusign/request-throttler";

//////////////////////////////////////////////////////////////////////
//
// UsersApi RESPONSE MOCKS
//
//////////////////////////////////////////////////////////////////////

const mockGetInformation = {
    userId: "34bade63-d863-4d12-a40d-5acd5a11fed0",
    userName: "fake.user",
    email: "fake.user@fakemail.com"
} as UserInformation;

const mockList = {
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
} as UserInformationList;

const mockCreate = {
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
} as NewUsersSummary;

const mockUpdateUser = {
    company: "FOO",
    createdDateTime: "0001-01-01T08:00:00.0000000Z",
    email: "fake-3.user@fakemail.com",
    jobTitle: "PSE",
    uri: "/users/91f04aed-c9fc-4803-a314-02a5fa48ada9",
    userAddedToAccountDateTime: "0001-01-01T08:00:00.0000000Z",
    userId: "91f04aed-c9fc-4803-a314-02a5fa48ada9",
} as UserInformation;

const mockDel = {
    users: [
        {
            uri: "/users/542892d7-4033-4563-90a0-c462c10eddcb",
            userId: "542892d7-4033-4563-90a0-c462c10eddcb",
            userStatus: "closed",
        }
    ]
} as UsersResponse;

//////////////////////////////////////////////////////////////////////
//
// GroupApi RESPONSE MOCKS
//
//////////////////////////////////////////////////////////////////////

const mockUpdateGroupUsers = {
    users: [
        {
            uri: "/users/91f04aed-c9fc-4803-a314-02a5fa48ada9",
            userId: "91f04aed-c9fc-4803-a314-02a5fa48ada9",
            userName: "fake-3.user",
            userStatus: "created",
            userType: "companyuser"
        }
    ]
} as UsersResponse;

const mockDeleteGroupUsers = {
    users: [
        {
            uri: "/users/91f04aed-c9fc-4803-a314-02a5fa48ada9",
            userId: "91f04aed-c9fc-4803-a314-02a5fa48ada9",
            userName: "fake-3.user",
            userStatus: "created",
            userType: "companyuser"
        }
    ]
} as UsersResponse;

const mockListGroups = {
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
} as GroupInformation;

//////////////////////////////////////////////////////////////////////
//
// DocuSignClient MOCKS
//
//////////////////////////////////////////////////////////////////////

const tokenDecodeMockResSuccess = {
    sub: "34bade63-d863-4d12-a40d-5acd5a11fed0",
    email: "fake.user@fakeorg.com",
    accounts: [
        {
            accountId: "836f97df-02d0-44cc-89ea-171b4becd420",
            isDefault: "true",
            accountName: "acme",
            baseUri: "https://fakeapi.acme.org",
            organization: {
                organization_id: "91e7941f-10d6-4369-b1b9-df2c7ac764e6",
                links: [
                    {
                        rel: "self",
                        href: "https://fake-d.org/organizations/91e7941f-10d6-4369-b1b9-df2c7ac764e6",
                    },
                ],
            },
        },
    ],
    name: "Fake User",
    givenName: "Fake",
    familyName: "User",
    created: "2021-06-10T09:02:33.19"
}

jest.mock("../src/docusign/dsclient", () => {
    return {
        DocuSignClient: jest.fn().mockImplementation(() => {
            return {
                getTokenUserInfo: jest.fn().mockImplementationOnce(() => {
                    return tokenDecodeMockResSuccess;
                }),
                refreshAccessToken: jest.fn().mockImplementation(() => {
                    return Promise.resolve({ access_token: "sahss1'mock^accesToyken" });
                })
            }
        })
    };
});

//////////////////////////////////////////////////////////////////////
//
// REQUEST THROTTLING MOCKS
//
//////////////////////////////////////////////////////////////////////

// defaults to user read
let apiResponse = Promise.resolve(mockGetInformation);

const __setMockResponseForApiCall: any = (mockRes: Promise<any>) => {
    apiResponse = mockRes;
};

jest.mock("../src/docusign/request-throttler", () => {
    return {
        executeRequestThrottleOn: jest.fn().mockImplementation(() => {
            return apiResponse;
        })
    };
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
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "b'nXQpVsglEGFJgfK'", "f73490fc-1a6e-42aa-a0a8-91bd09a68403", "-----BEGIN RSA PRIVATE KEY-----"));
    })

    test("[0] ds client to be defined", async () => {
        expect(inst.dsClient).toBeDefined();
    });
});

describe("getTokenUserInfo", () => {
    let inst: docusign.DocuSign;
    let userId = '34bade63-d863-4d12-a40d-5acd5a11fed0';

    beforeEach(() => {
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "b'nXQpVsglEGFJgfK'", "f73490fc-1a6e-42aa-a0a8-91bd09a68403", "-----BEGIN RSA PRIVATE KEY-----"));
    });

    test("[0] get token user information", async () => {
        let result: any = await inst.getTokenUserInfo();
        expect(inst.dsClient.getTokenUserInfo).toBeCalled();
        expect(inst.dsClient.getTokenUserInfo).toBeCalledTimes(1);
        expect(result.sub).toStrictEqual(userId);
    });
});

describe("getUser", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let userId = '34bade63-d863-4d12-a40d-5acd5a11fed0';

    beforeEach(() => {
        __setMockResponseForApiCall(mockGetInformation);
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "b'nXQpVsglEGFJgfK'", "f73490fc-1a6e-42aa-a0a8-91bd09a68403", "-----BEGIN RSA PRIVATE KEY-----"));
    });

    test("[o] get user", async () => {
        let result: any = await inst.getUser(accountId, userId);

        expect(result.userId).toStrictEqual(userId);
        expect(executeRequestThrottleOn).toBeCalled();
        expect(executeRequestThrottleOn).toBeCalledTimes(1);

    });
});

describe("listUsers", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';

    beforeEach(() => {
        __setMockResponseForApiCall(mockList);
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "b'nXQpVsglEGFJgfK'", "f73490fc-1a6e-42aa-a0a8-91bd09a68403", "-----BEGIN RSA PRIVATE KEY-----"));
    });

    test("[0] list users", async () => {
        let result = await inst.listUsers(accountId, {});

        expect(executeRequestThrottleOn).toBeCalled();
        expect(executeRequestThrottleOn).toBeCalledTimes(1);
        expect(result.totalSetSize).toStrictEqual("2");
    });
});

describe("listEntitlements", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';

    beforeEach(() => {
        __setMockResponseForApiCall(mockListGroups);
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "b'nXQpVsglEGFJgfK'", "f73490fc-1a6e-42aa-a0a8-91bd09a68403", "-----BEGIN RSA PRIVATE KEY-----"));
    });

    test("[0] list entitlements", async () => {
        let result = await inst.listEntitlements(accountId, {});

        expect(executeRequestThrottleOn).toBeCalled();
        expect(executeRequestThrottleOn).toBeCalledTimes(1);
        expect(result.totalSetSize).toStrictEqual("4");
    });
});

describe("createUser", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let userId = "91f04aed-c9fc-4803-a314-02a5fa48ada9";
    let userName = "fake-3.user";

    beforeEach(() => {
        __setMockResponseForApiCall(mockCreate);
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "b'nXQpVsglEGFJgfK'", "f73490fc-1a6e-42aa-a0a8-91bd09a68403", "-----BEGIN RSA PRIVATE KEY-----"));
    });

    test("[0] create user", async () => {
        let result: any = await inst.createUser(accountId, {});

        expect(executeRequestThrottleOn).toBeCalled();
        expect(executeRequestThrottleOn).toBeCalledTimes(1);
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
        __setMockResponseForApiCall(mockUpdateUser);
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "b'nXQpVsglEGFJgfK'", "f73490fc-1a6e-42aa-a0a8-91bd09a68403", "-----BEGIN RSA PRIVATE KEY-----"));
    });

    test("[0] update user", async () => {
        let result = await inst.updateUser(accountId, userId, {});

        expect(executeRequestThrottleOn).toBeCalled();
        expect(executeRequestThrottleOn).toBeCalledTimes(1);
        expect(result.company).toStrictEqual(company);
        expect(result.jobTitle).toStrictEqual(jobTitle);
    });
});

describe("deleteUser", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let userId = '542892d7-4033-4563-90a0-c462c10eddcb';

    beforeEach(() => {
        __setMockResponseForApiCall(mockDel);
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "b'nXQpVsglEGFJgfK'", "f73490fc-1a6e-42aa-a0a8-91bd09a68403", "-----BEGIN RSA PRIVATE KEY-----"));
    });

    test("[0] delete user", async () => {
        let result: any = await inst.deleteUser(accountId, userId);

        expect(executeRequestThrottleOn).toBeCalled();
        expect(executeRequestThrottleOn).toBeCalledTimes(1);
        expect(result.users[0].userId).toStrictEqual(userId);
        expect(result.users[0].userStatus).toStrictEqual("closed");
    });
});

describe("updateGroupUsers", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let groupId = '8267667';

    beforeEach(() => {
        __setMockResponseForApiCall(mockUpdateGroupUsers);
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "b'nXQpVsglEGFJgfK'", "f73490fc-1a6e-42aa-a0a8-91bd09a68403", "-----BEGIN RSA PRIVATE KEY-----"));
    });

    test("[0] add user to group", async () => {
        let result: any = await inst.updateGroupUsers(accountId, groupId, {});

        expect(executeRequestThrottleOn).toBeCalled();
        expect(executeRequestThrottleOn).toBeCalledTimes(1);
        expect(result.users[0].userId).toStrictEqual('91f04aed-c9fc-4803-a314-02a5fa48ada9');
    });
});

describe("deleteGroupUsers", () => {
    let inst: docusign.DocuSign;
    let accountId = '14072015';
    let groupId = '8267667';

    beforeEach(() => {
        __setMockResponseForApiCall(mockDeleteGroupUsers);
        inst = new docusign.DocuSign(
            new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "b'nXQpVsglEGFJgfK'", "f73490fc-1a6e-42aa-a0a8-91bd09a68403", "-----BEGIN RSA PRIVATE KEY-----"));
    });

    test("[0] remove user from group", async () => {
        let result: any = await inst.deleteGroupUsers(accountId, groupId, {});

        expect(executeRequestThrottleOn).toBeCalled();
        expect(executeRequestThrottleOn).toBeCalledTimes(1);
        expect(result.users[0].userId).toStrictEqual('91f04aed-c9fc-4803-a314-02a5fa48ada9');
    });
});
