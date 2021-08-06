/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import * as dseConnector from "../src/connectors/dse-connector";
import { GroupInformation, NewUsersSummary, UserInformation, UserInformationList, UsersResponse } from "docusign-esign";
import { DseConnector } from "../src/connectors/dse-connector";
import { Context, ResponseStream, StdAccountReadInput, StdAccountListOutput, StdAccountReadOutput, StdEntitlementListOutput, StdAccountDeleteInput, StdAccountCreateInput, StdAccountCreateOutput, StdAccountUpdateInput, StdAccountUpdateOutput } from "@sailpoint/connector-sdk";
import { DseConfig } from "../src/connectors/dse-config";
import { PassThrough } from "stream";
import { DocuSignClient } from "../src/docusign/dsclient";
import { DocuSign } from '../src/docusign/docusign'
import request, { ResponseError } from 'superagent';
import { InvalidResponseError } from "../src/connectors/invalid-response-error";

//////////////////////////////////////////////////////////////////////
//
// COMMON CONSTANTS
//
//////////////////////////////////////////////////////////////////////

const mockContext: Context = {
    config: {
        apiUrl: "https://fakeapi.acme.org/restapi",
        oauthServerUrl: "https://fakeorg-d.org",
        accountId: '14072015',
        clientId: "b'nXQpVsglEGFJgfK'",
        clientSecret: "clS3cRet",
        refreshToken: "r4fesh'Tonaken"
    },
    id: "54bcaba7-5698-4471-a1b0-26274d4af74b",
    name: "DocuSign eSignature",
    version: 1.0
}

const mockConfig = mockContext.config as DseConfig;

////////// Unauthorized 401 error //////////////
const unauthorizedError = new Error("Unauthorized") as ResponseError;
unauthorizedError.status = 401;
unauthorizedError.stack = "Error: Unauthorized\n    at Request.Object.<anonymous>.Request.callback (/Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/index.js:696:15)\n    at /Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/index.js:906:18\n    at IncomingMessage.<anonymous> (/Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/parsers/json.js:19:7)\n    at IncomingMessage.emit (node:events:377:35)\n    at IncomingMessage.emit (node:domain:470:12)\n    at endReadableNT (node:internal/streams/readable:1312:12)\n    at processTicksAndRejections (node:internal/process/task_queues:83:21)";

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

const tokenDecodeMockResUndefined = undefined;

const tokenDecodeMockResError: ResponseError = {
    message: "Unauthorized",
    stack: "Error: Unauthorized\n    at Request.Object.<anonymous>.Request.callback (/Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/index.js:696:15)\n    at /Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/index.js:906:18\n    at IncomingMessage.<anonymous> (/Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/parsers/json.js:19:7)\n    at IncomingMessage.emit (node:events:377:35)\n    at IncomingMessage.emit (node:domain:470:12)\n    at endReadableNT (node:internal/streams/readable:1312:12)\n    at processTicksAndRejections (node:internal/process/task_queues:83:21)",
    status: 401,
    response: {}
} as ResponseError;


// default to success
let tokenDecodeRes: Promise<any> = Promise.resolve(tokenDecodeMockResSuccess);

const __setMockTokenDecodeResponse: any = (mockRes: Promise<any>) => {
    tokenDecodeRes = mockRes;
}

jest.mock("../src/docusign/dsclient", () => {
    return {
        DocuSignClient: jest.fn().mockImplementation(() => {
            return {
                getTokenUserInfo: jest.fn().mockImplementationOnce(() => {
                    return tokenDecodeRes;
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
// DocuSign MOCKS
//
//////////////////////////////////////////////////////////////////////

////////////////////// user read connector output ///////////////////
const userReadOut = {
    identity: '45bade63-d863-4d12-a40d-5acd5a11fet7',
    uuid: '45bade63-d863-4d12-a40d-5acd5a11fet7',
    attributes: {
        userName: 'fake-2.user',
        userId: '45bade63-d863-4d12-a40d-5acd5a11fet7',
        userType: undefined,
        isAdmin: undefined,
        isNAREnabled: undefined,
        userStatus: undefined,
        uri: undefined,
        email: 'fake-2.user@fakemail.com',
        firstName: undefined,
        lastName: undefined,
        jobTitle: undefined,
        company: undefined,
        permissionProfileId: undefined,
        permissionProfileName: undefined,
        sendActivationOnInvalidLogin: undefined,
        enableConnectForUser: undefined,
        groups: ['8275323'],
        defaultAccountId: undefined,
        createdDateTime: undefined,
        lastLogin: undefined
    }
} as StdAccountReadOutput;

/////////////////// user read docusign mocked responses /////////////////
const userReadMockResSuccess = {
    userId: "45bade63-d863-4d12-a40d-5acd5a11fet7",
    userName: "fake-2.user",
    email: "fake-2.user@fakemail.com",
    groupList: [
        {
            groupId: "8275323",
            groupName: "View User Group",
            groupType: "customGroup",
            permissionProfileId: "11679476"
        }
    ]
} as UserInformation;
const userReadMockResUndefined = undefined;
let userReadRes: Promise<UserInformation> = Promise.resolve(userReadMockResSuccess);
const __setMockUserReadResponse: any = (mockRes: Promise<UserInformation>) => {
    userReadRes = mockRes;
}

////////////////// user list docusign mocked response ///////////////
const userListMockResSuccess = {
    users: [
        {
            userId: "34bade63-d863-4d12-a40d-5acd5a11fed0",
            userName: "fake-1.user",
            email: "fake-1.user@fakemail.com",
            groupList: [
                {
                    groupId: "8265840",
                    groupName: "Everyone",
                    groupType: "everyoneGroup",
                    permissionProfileId: "11679478"
                }
            ]
        },
        {
            userId: "45bade63-d863-4d12-a40d-5acd5a11fet7",
            userName: "fake-2.user",
            email: "fake-2.user@fakemail.com",
            groupList: [
                {
                    groupId: "8275323",
                    groupName: "View User Group",
                    groupType: "customGroup",
                    permissionProfileId: "11679476"
                }
            ]
        }
    ],
    endPosition: "1",
    resultSetSize: "2",
    startPosition: "0",
    totalSetSize: "2"
} as UserInformationList;
const userListMockResUndefined = undefined;
let userListRes: Promise<UserInformationList> = Promise.resolve(userListMockResSuccess);
const __setMockUserListResponse: any = (mockRes: Promise<UserInformationList>) => {
    userListRes = mockRes;
}

////////////////// user list docusign mocked responses ///////////////
const entitlementListMockResSuccess = {
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
const entitlementListMockResUndefined = undefined;
let entitlementListRes: Promise<GroupInformation> = Promise.resolve(entitlementListMockResSuccess);
const __setMockEntitlementListResponse: any = (mockRes: Promise<GroupInformation>) => {
    entitlementListRes = mockRes;
}
const entitlementReadOut = {
    identity: '8275323',
    uuid: '8275323',
    attributes: {
        groupId: '8275323',
        groupName: 'View User Group',
        groupType: 'customGroup',
        permissionProfileId: '11679476',
        usersCount: '3'
    }
} as StdEntitlementListOutput;

/////////////////////// User delete docusign mocked responses ///////////////////
const userDelMockResSuccess = {
    users: [
        {
            uri: "/users/542892d7-4033-4563-90a0-c462c10eddcb",
            userId: "542892d7-4033-4563-90a0-c462c10eddcb",
            userStatus: "closed",
        }
    ]
} as UsersResponse;
const userDelMockResUndefined = undefined;
let userDelRes: Promise<UsersResponse> = Promise.resolve(userDelMockResSuccess);
const __setMockUserDelResponse: any = (mockRes: Promise<UsersResponse>) => {
    userDelRes = mockRes;
}

////////////////////// User creation docusign mocked responses //////////////////
const userCreateMockResSuccess = {
    newUsers: [
        {
            userName: "fake-2.user",
            userStatus: "ActivationSent",
            userId: "3b39b5b7-9fbb-49fa-9a91-78097bc22b29",
            uri: "/users/3b39b5b7-9fbb-49fa-9a91-78097bc22b29",
            email: "fake-2.user@fakemail.com",
            createdDateTime: "2021-08-02T10:28:17.3030000Z"
        }
    ]
} as NewUsersSummary;
const userCreateMockResInvalidUserError = {
    newUsers: [
        {
            errorDetails: {
                errorCode: 'INVALID_USERNAME',
                message: 'Username is missing'
            }
        }
    ]
} as NewUsersSummary;
const userCreateMockResUndefined = undefined;
let userCreateRes: Promise<NewUsersSummary> = Promise.resolve(userCreateMockResSuccess);
const __setMockUserCreateResponse: any = (mockRes: Promise<NewUsersSummary>) => {
    userCreateRes = mockRes;
}

//////////////// Update user mocked responses ///////////////////////
const userUpdateMockResSuccess = {
    company: "FOO",
    createdDateTime: "0001-01-01T08:00:00.0000000Z",
    email: "fake-2.user@fakemail.com",
    jobTitle: "PSE",
    uri: "/users/3b39b5b7-9fbb-49fa-9a91-78097bc22b29",
    userAddedToAccountDateTime: "0001-01-01T08:00:00.0000000Z",
    userId: "3b39b5b7-9fbb-49fa-9a91-78097bc22b29",
} as UserInformation;
const userUpdateMockResWireError = {
    errno: -3008,
    code: "ENOTFOUND",
    syscall: "getaddrinfo",
    hostname: "demo.docusign1.net",
    response: undefined
} as UserInformation;
const userUpdateMockResUndefined = undefined;
let userUpdateRes = Promise.resolve(userUpdateMockResSuccess);
const __setMockUserUpdateResponse: any = (mockRes: Promise<UserInformation>) => {
    userUpdateRes = mockRes;
}

///////////////// Request an entitlement mocked responses ///////////////////
const entRequestMockResSuccess = {
    users: [
        {
            uri: "/users/3b39b5b7-9fbb-49fa-9a91-78097bc22b29",
            userId: "3b39b5b7-9fbb-49fa-9a91-78097bc22b29",
            userName: "fake-2.user",
            userStatus: "active",
            userType: "companyuser"
        }
    ]
} as UsersResponse;
const entRequestMockResInvalidUser = {
    users: [
        {
            errorDetails: {
                errorCode: 'INVALID_USERNAME',
                message: 'Username is missing'
            }
        }
    ]
} as UsersResponse;
const entRequestMockResWireError = {
    errno: -3008,
    code: "ENOTFOUND",
    syscall: "getaddrinfo",
    hostname: "demo.docusign1.net",
    response: undefined
} as UsersResponse;
const entRequestMockResUndefined = undefined;
let entRequestRes: Promise<UsersResponse> = Promise.resolve(entRequestMockResSuccess);
const __setMockEntReqResponse: any = (mockRes: Promise<UsersResponse>) => {
    entRequestRes = mockRes;
}
let entRequestRes2: Promise<UsersResponse> = Promise.resolve(entRequestMockResSuccess);
const __setMockEntReqResponse2: any = (mockRes: Promise<UsersResponse>) => {
    entRequestRes2 = mockRes;
}

///////////////// Revoke an entitlement mocked responses ///////////////////
const entRevokeMockResSuccess = {
    users: [
        {
            uri: "/users/3b39b5b7-9fbb-49fa-9a91-78097bc22b29",
            userId: "3b39b5b7-9fbb-49fa-9a91-78097bc22b29",
            userName: "fake-2.user",
            userStatus: "active",
            userType: "companyuser"
        }
    ]
} as UsersResponse;
const entRevokeMockResUndefined = undefined;
let entRevokeRes: Promise<UsersResponse> = Promise.resolve(entRevokeMockResSuccess);
const __setMockEntRevokeResponse: any = (mockRes: Promise<UsersResponse>) => {
    entRevokeRes = mockRes;
}

//////////////// mock for docusign ///////////////////////
jest.mock("../src/docusign/docusign", () => {
    return {
        DocuSign: jest.fn().mockImplementation(() => {
            return {
                dsClient: new DocuSignClient(mockConfig.apiUrl,
                    mockConfig.oauthServerUrl, mockConfig.clientId,
                    mockConfig.clientSecret, mockConfig.clientSecret),
                getUser: jest.fn().mockImplementationOnce(() => {
                    return userReadRes;
                }),
                listUsers: jest.fn().mockImplementationOnce(() => {
                    return userListRes;
                }),
                listEntitlements: jest.fn().mockImplementationOnce(() => {
                    return entitlementListRes;
                }),
                deleteUser: jest.fn().mockImplementationOnce(() => {
                    return userDelRes;
                }),
                createUser: jest.fn().mockImplementationOnce(() => {
                    return userCreateRes;
                }),
                updateUser: jest.fn().mockImplementationOnce(() => {
                    return userUpdateRes;
                }),
                updateGroupUsers: jest.fn().mockImplementationOnce(() => {
                    return entRequestRes;
                }).mockImplementationOnce(() => {
                    return entRequestRes2
                }),
                deleteGroupUsers: jest.fn().mockImplementationOnce(() => {
                    return entRevokeRes;
                })
            };
        })
    };
});

//////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////

describe("constructor", () => {
    let inst: dseConnector.DseConnector;

    beforeEach(() => {
        inst = new DseConnector(mockConfig);
    });

    test("[0] DocuSignClient called", async () => {
        expect(DocuSignClient).toHaveBeenCalled();
        expect(DocuSignClient).toHaveBeenCalledTimes(2);
    });

    test("[0] DocuSign called", async () => {
        expect(DocuSign).toHaveBeenCalled();
        expect(DocuSign).toHaveBeenCalledTimes(1);
    });
});

describe("testConnection", () => {
    let inst: dseConnector.DseConnector;

    beforeEach(() => {
        __setMockTokenDecodeResponse(Promise.resolve(tokenDecodeMockResSuccess));
        __setMockUserReadResponse(Promise.resolve(userReadMockResSuccess));

        inst = new DseConnector(mockConfig);
    });

    afterAll(() => {
        __setMockTokenDecodeResponse(Promise.resolve(tokenDecodeMockResSuccess));
        __setMockUserReadResponse(Promise.resolve(userReadMockResSuccess));
    });

    test("[0] test connection success", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.testConnection(new ResponseStream<any>(outStream));

        outStream.on('data', (chunk) => expect(chunk).toStrictEqual({}));
    });

    test("[1] empty response in token decode", () => {
        __setMockTokenDecodeResponse(Promise.resolve(tokenDecodeMockResUndefined))

        expect(inst.testConnection(new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('Found empty response for token decode.');
    });

    test("[2] exception in token decode", () => {
        __setMockTokenDecodeResponse(Promise.reject(unauthorizedError))

        expect(inst.testConnection(new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('401 Unauthorized');
    });

    test("[3] empty response in user info read", () => {
        __setMockUserReadResponse(Promise.resolve(userReadMockResUndefined));

        expect(inst.testConnection(new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('Found empty response for user read.');
    });

    test("[4] exception in user info read", () => {
        __setMockUserReadResponse(Promise.reject(unauthorizedError));

        expect(inst.testConnection(new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('401 Unauthorized');
    });
});

describe("readAccount", () => {
    let inst: dseConnector.DseConnector;
    let nativeIdentifier: StdAccountReadInput = { identity: '45bade63-d863-4d12-a40d-5acd5a11fet7' } as StdAccountReadInput;

    beforeEach(() => {
        __setMockUserReadResponse(Promise.resolve(userReadMockResSuccess));
        inst = new DseConnector(mockConfig);
    });

    test("[0] read account success", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.readAccount(nativeIdentifier, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk) => expect(chunk).toMatchObject(userReadOut));
    });

    test("[1] empty response in account read", () => {
        __setMockUserReadResponse(Promise.resolve(userReadMockResUndefined));

        expect(inst.readAccount(nativeIdentifier, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('Found empty response for user read.');
    });

    test("[2] exception in account read", () => {
        __setMockUserReadResponse(Promise.reject(unauthorizedError));

        expect(inst.readAccount(nativeIdentifier, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('401 Unauthorized');
    });

    test("[3] empty native identifier", () => {
        expect(inst.readAccount({ identity: '' }, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('Native identifier cannot be empty.');
    });
});

describe("listAccounts", () => {
    let inst: dseConnector.DseConnector;

    beforeEach(() => {
        __setMockUserListResponse(Promise.resolve(userListMockResSuccess));
        inst = new DseConnector(mockConfig);
    });

    test("[0] list accounts success", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.listAccounts(new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: any) => expect(chunk).toMatchSnapshot(userReadOut));
    });

    test("[1] list account empty response", () => {
        __setMockUserListResponse(Promise.resolve(userListMockResUndefined));

        expect(inst.listAccounts(new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('Found empty response for user read.');
    });

    test("[2] exception in list account", () => {
        __setMockUserListResponse(Promise.reject(unauthorizedError));

        expect(inst.listAccounts(new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("401 Unauthorized");
    });
});

describe("listEntitlements", () => {
    let inst: dseConnector.DseConnector;

    beforeEach(() => {
        __setMockEntitlementListResponse(Promise.resolve(entitlementListMockResSuccess));
        inst = new DseConnector(mockConfig);
    });

    test("[0] list entitlements success", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.listEntitlements(new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: any) => expect(chunk).toMatchSnapshot(entitlementReadOut));
    });

    test("[1] empty response in list entitlements", () => {
        __setMockEntitlementListResponse(Promise.resolve(entitlementListMockResUndefined));

        expect(inst.listEntitlements(new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('Found empty response for group read.');
    });

    test("[2] exception in list entitlements", () => {
        __setMockEntitlementListResponse(Promise.reject(unauthorizedError));

        expect(inst.listEntitlements(new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("401 Unauthorized");
    });
});

describe("createAccount", () => {
    let inst: dseConnector.DseConnector;
    let accountInput: StdAccountCreateInput = {
        identity: "",
        attributes: {
            userName: "fake-2.user",
            email: "fake-2.user@fakemail.com"
        }
    } as StdAccountCreateInput;

    let accountInputNoUsername: StdAccountCreateInput = {
        identity: "",
        attributes: {
            email: "fake-2.user@fakemail.com"
        }
    } as StdAccountCreateInput;

    let accountEntInput: StdAccountCreateInput = {
        identity: "",
        attributes: {
            userName: "fake-2.user",
            email: "fake-2.user@fakemail.com",
            groups: '8275323'
        }
    } as StdAccountCreateInput;

    let accountEntInputArray: StdAccountCreateInput = {
        identity: "",
        attributes: {
            userName: "fake-2.user",
            email: "fake-2.user@fakemail.com",
            groups: ['8275323', '8275321']
        }
    } as StdAccountCreateInput;

    beforeEach(() => {
        __setMockUserCreateResponse(Promise.resolve(userCreateMockResSuccess));
        __setMockUserReadResponse(Promise.resolve(userReadMockResSuccess));
        __setMockEntReqResponse(Promise.resolve(entRequestMockResSuccess))

        inst = new DseConnector(mockConfig);
    });

    test("[0] create account success", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.createAccount(accountInput, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountCreateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[1] create account with request entitlement success", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.createAccount(accountEntInput, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountCreateOutput) => expect(chunk.attributes.groups[0]).toStrictEqual('8275323'));
    });

    test("[2] create account with request entitlement[array] success", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.createAccount(accountEntInputArray, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountCreateOutput) => expect(chunk.attributes.groups[0]).toStrictEqual('8275323'));
    });

    test("[3] empty response for account create", () => {
        __setMockUserCreateResponse(Promise.resolve(userCreateMockResUndefined));

        expect(inst.createAccount(accountInput, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('Found empty response for user creation.');
    });

    test("[4] exception in account create", () => {
        __setMockUserCreateResponse(Promise.reject(unauthorizedError));

        expect(inst.createAccount(accountInput, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("401 Unauthorized");
    });

    test("[5] exception when no userId in create account response", () => {
        __setMockUserCreateResponse(Promise.resolve({ newUsers: [{ userName: "Abel Tuter", userId: "" }] } as NewUsersSummary));

        expect(inst.createAccount(accountInput, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("User creation failed.");
    });

    test("[6] exception when userName is not provided", () => {
        __setMockUserCreateResponse(Promise.resolve(userCreateMockResInvalidUserError));

        expect(inst.createAccount(accountInputNoUsername, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("INVALID_USERNAME - Username is missing");
    });

    test("[7] all entitlement updates failed but create account succeed - 1 ", async () => {
        __setMockEntReqResponse(Promise.resolve(entRequestMockResInvalidUser))

        let outStream = new PassThrough({ objectMode: true });
        await inst.createAccount(accountEntInput, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountCreateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[8] all entitlement updates failed but create account succeed - 2", async () => {
        __setMockEntReqResponse(Promise.resolve(entRequestMockResWireError))

        let outStream = new PassThrough({ objectMode: true });
        await inst.createAccount(accountEntInput, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountCreateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[9] all entitlement updates failed but create account succeed - 3", async () => {
        __setMockEntReqResponse(Promise.resolve(unauthorizedError))

        let outStream = new PassThrough({ objectMode: true });
        await inst.createAccount(accountEntInput, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountCreateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[10] some entitlement updates failed but create account succeed", async () => {
        __setMockEntReqResponse2(Promise.resolve(unauthorizedError))

        let outStream = new PassThrough({ objectMode: true });
        await inst.createAccount(accountEntInputArray, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountCreateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });
});

describe("updateAccount", () => {
    let inst: dseConnector.DseConnector;
    let accountUpdatePlanForAttrChanges = {
        identity: "45bade63-d863-4d12-a40d-5acd5a11fet7",
        changes: [
            {
                op: 'Add',
                attribute: 'firstName',
                value: 'fake-2'
            }
        ]
    } as StdAccountUpdateInput;
    let nativeIdEmptyPlan = {
        identity: "",
        changes: [
            {
                op: 'Add',
                attribute: 'firstName',
                value: 'fake-2'
            }
        ]
    } as StdAccountUpdateInput;
    let accountUpdatePlanForGroupAccess = {
        identity: "45bade63-d863-4d12-a40d-5acd5a11fet7",
        changes: [
            {
                op: 'Add',
                attribute: 'groups',
                value: '8275323'
            },
            {
                op: 'Add',
                attribute: 'groups',
                value: '8275321'
            }
        ]
    } as StdAccountUpdateInput;

    let accountUpdatePlanForGroupRevoke = {
        identity: "45bade63-d863-4d12-a40d-5acd5a11fet7",
        changes: [
            {
                op: 'Remove',
                attribute: 'groups',
                value: '8275321'
            }
        ]
    } as StdAccountUpdateInput;

    let accountUpdatePlanForAttrChangesAndEntChanges = {
        identity: "45bade63-d863-4d12-a40d-5acd5a11fet7",
        changes: [
            {
                op: 'Add',
                attribute: 'firstName',
                value: 'fake-2'
            },
            {
                op: 'Add',
                attribute: 'groups',
                value: '8275323'
            },
            {
                op: 'Add',
                attribute: 'groups',
                value: '8275321'
            }
        ]
    } as StdAccountUpdateInput;

    beforeEach(() => {
        __setMockUserUpdateResponse(Promise.resolve(userUpdateMockResSuccess));
        __setMockEntReqResponse(Promise.resolve(entRequestMockResSuccess));
        __setMockEntRevokeResponse(Promise.resolve(entRevokeMockResSuccess));
        __setMockUserReadResponse(Promise.resolve(userReadMockResSuccess));

        inst = new DseConnector(mockConfig);
    });

    test("[0] update account success", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForAttrChanges, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[1] update account for access request", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForGroupAccess, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => {
            expect(chunk?.attributes?.groups[0]).toStrictEqual('8275323');
        });
    });

    test("[2] update account for revoke access", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForGroupRevoke, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => {
            expect(chunk?.attributes?.groups[0]).toStrictEqual('8275323');
        });
    });

    test("[3] exception when native identifier is empty", () => {
        expect(inst.updateAccount(nativeIdEmptyPlan, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("Native identifier cannot be empty.");
    });

    test("[4] requested only attr update and it failed with exception", () => {
        __setMockUserUpdateResponse(Promise.resolve(unauthorizedError));

        expect(inst.updateAccount(accountUpdatePlanForAttrChanges, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("401 Unauthorized");
    });

    test("[5] requested two entitlements and all entitlement updates for an account failed", () => {
        __setMockEntReqResponse(Promise.resolve(entRequestMockResWireError));
        __setMockEntReqResponse2(Promise.resolve(entRequestMockResInvalidUser));

        expect(inst.updateAccount(accountUpdatePlanForGroupAccess, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("All entitlement updates to the account [45bade63-d863-4d12-a40d-5acd5a11fet7] are failed.");
    });

    test("[6] requested two entitlements but one entitlement updates failed with invalid user error and other succeed, and hence user update success", async () => {
        __setMockEntReqResponse(Promise.resolve(entRequestMockResInvalidUser));
        __setMockEntReqResponse2(Promise.resolve(entRequestMockResSuccess));

        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForGroupAccess, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[7] requested two entitlements but one entitlement updates failed with wire error and other succeed, and hence user update success", async () => {
        __setMockEntReqResponse(Promise.resolve(entRequestMockResWireError));
        __setMockEntReqResponse2(Promise.resolve(entRequestMockResSuccess));

        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForGroupAccess, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[8] mix request - success", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForAttrChangesAndEntChanges, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[9] mix request - entitlement request failed with wire error, but user update success", async () => {
        __setMockEntReqResponse(Promise.resolve(entRequestMockResWireError));

        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForAttrChangesAndEntChanges, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[10] mix request - entitlement request failed due to invalid user, but user update success", async () => {
        __setMockEntReqResponse(Promise.resolve(entRequestMockResInvalidUser));

        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForAttrChangesAndEntChanges, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[11] mix request - entitlement request failed due to 410 error, but user update success", async () => {
        __setMockEntReqResponse(Promise.resolve(unauthorizedError));

        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForAttrChangesAndEntChanges, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[12] mix request - entitlement request success, but user attr update failed", async () => {
        __setMockUserUpdateResponse(Promise.resolve(userUpdateMockResWireError));

        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForAttrChangesAndEntChanges, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[13.1] mix request - one entitlement request failed, one entitlement succeeded, and user attr update failed", async () => {
        __setMockUserUpdateResponse(Promise.resolve(userUpdateMockResWireError));
        __setMockEntReqResponse(Promise.resolve(entRequestMockResWireError));

        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForAttrChangesAndEntChanges, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[13.2] mix request - one entitlement request failed, one entitlement succeeded, and user attr update failed", async () => {
        __setMockUserUpdateResponse(Promise.resolve(userUpdateMockResWireError));
        __setMockEntReqResponse(Promise.resolve(entRequestMockResInvalidUser));

        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForAttrChangesAndEntChanges, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[13.3] mix request - one entitlement request failed, one entitlement succeeded, and user attr update failed", async () => {
        __setMockUserUpdateResponse(Promise.resolve(userUpdateMockResWireError));
        __setMockEntReqResponse(Promise.resolve(unauthorizedError));

        let outStream = new PassThrough({ objectMode: true });
        await inst.updateAccount(accountUpdatePlanForAttrChangesAndEntChanges, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: StdAccountUpdateOutput) => expect(chunk.identity).toStrictEqual('45bade63-d863-4d12-a40d-5acd5a11fet7'));
    });

    test("[14.1] mix request - both entitlement request failed, and user attr update failed", async () => {
        __setMockUserUpdateResponse(Promise.resolve(userUpdateMockResWireError));
        __setMockEntReqResponse(Promise.resolve(unauthorizedError));
        __setMockEntReqResponse2(Promise.resolve(entRequestMockResInvalidUser));

        expect(inst.updateAccount(accountUpdatePlanForAttrChangesAndEntChanges, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("All updates to the account [45bade63-d863-4d12-a40d-5acd5a11fet7] are failed.");
    });

    test("[14.2] mix request - both entitlement request failed, and user attr update failed", async () => {
        __setMockUserUpdateResponse(Promise.resolve(userUpdateMockResWireError));
        __setMockEntReqResponse(Promise.resolve(entRequestMockResWireError));
        __setMockEntReqResponse2(Promise.resolve(entRequestMockResInvalidUser));

        expect(inst.updateAccount(accountUpdatePlanForAttrChangesAndEntChanges, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("All updates to the account [45bade63-d863-4d12-a40d-5acd5a11fet7] are failed.");
    });
});

describe("deleteAccount", () => {
    let inst: dseConnector.DseConnector;
    let nativeIdentifier: StdAccountDeleteInput = { identity: "542892d7-4033-4563-90a0-c462c10eddcb" } as StdAccountDeleteInput;

    beforeEach(() => {
        __setMockUserDelResponse(Promise.resolve(userDelMockResSuccess));
        inst = new DseConnector(mockConfig);
    });

    test("[0] delete account success", async () => {
        let outStream = new PassThrough({ objectMode: true });
        await inst.deleteAccount(nativeIdentifier, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: any) => expect(chunk).toStrictEqual({}));
    });

    test("[1] empty response in user del", () => {
        __setMockUserDelResponse(Promise.resolve(userDelMockResUndefined));

        expect(inst.deleteAccount(nativeIdentifier, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('Found empty response for user deletion.');
    });

    test("[2] exception in user del", () => {
        __setMockUserDelResponse(Promise.reject(unauthorizedError));

        expect(inst.deleteAccount(nativeIdentifier, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError("401 Unauthorized");
    });

    test("[3] empty native identifier", () => {
        expect(inst.deleteAccount({ identity: '' }, new ResponseStream<any>(new PassThrough({ objectMode: true }))))
            .rejects
            .toThrowError('Native identifier cannot be empty.');
    });
});
