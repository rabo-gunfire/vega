/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import {
    Context,
    StandardCommand,
    StdAccountCreateInput,
    StdAccountCreateOutput,
    StdAccountDeleteInput,
    StdAccountDeleteOutput,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdAccountUpdateInput,
    StdEntitlementListOutput,
    StdTestConnectionOutput,
} from '@sailpoint/connector-sdk';
import { PassThrough } from 'stream';

//////////////////////////////////////////////////////////////////////
//
// COMMON CONSTANTS
//
//////////////////////////////////////////////////////////////////////

// initialize app configuration context
const context: Context = {
    id: "54bcaba7-5698-4471-a1b0-26274d4af74b",
    name: "DocuSign eSignature",
    version: 1.0
}

// source configuration
const config = {
    apiUrl: 'https://demo.docusign.net',
    oauthServerUrl: 'https://account-d.docusign.com',
    accountId: '14072015',
    clientId: 'df45eb70-ba0f-4106-9e0f-ce83fdb4d4a9',
    clientSecret: '403ab462-76b8-4037-af7b-094eec3bd338',
    refreshToken: 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAgABwAAgHl7VlfZSAgAAADec-lu2UgCAGPeujRj2BJNpA1azVoR_tAVAAEAAAAYAAEAAAAFAAAADQAkAAAAZGY0NWViNzAtYmEwZi00MTA2LTllMGYtY2U4M2ZkYjRkNGE5IgAkAAAAZGY0NWViNzAtYmEwZi00MTA2LTllMGYtY2U4M2ZkYjRkNGE5MACAvK95VlfZSDcAJrckfLbkskWwVEu_I6YOXQ.kRShKeu9KP4lqvOBY6wbgy6T5P8yadLEUdNjFJk8Vtoh9j3w_2xHRYJWfeya0-9YSeZndTmkvYh5Bvz_LtVxDdlx_cv1bUCJwMgUp-KUaIhmLRFcENfuxL1TW5WVjdxwDLDs6hoQKsdMm5btAjKgJrHJx2tGIMc5SEfUEl2RjAZ7DtpC76ued0mTHK2tBSyOBvZuefHnUYbtBOo8I1HZA893UKPnUr9h0tkzgg-mHYBy1GdQlKKGplVJIWSgzdS1xJr92evxkN6VRhA4QIcXp8FDebsy5B2iv5odsI4jPatQQ8DpOvi80vWDGqfuve3xzt_fAFPf1YeFWsvPNeuX3Q'
}

// set config in node process env
process.env.CONNECTOR_CONFIG = Buffer.from(JSON.stringify(config), 'utf-8').toString('base64');

// user fake-1.user
const docusignUserId = "f73490fc-1a6e-42aa-a0a8-91bd09a68403";

const createUUID = (): string => {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;
}

//////////////////////////////////////////////////////////////////////
//
// IMPORTS
//
//////////////////////////////////////////////////////////////////////

import { connector } from '../src/index';

//////////////////////////////////////////////////////////////////////
//
// UNMOCK
//
//////////////////////////////////////////////////////////////////////

// Integration tests shouldn't mock anything.
jest.unmock("superagent");

//////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////

/**
 * Test the connection
 */
describe("Test Connection", () => {
    // jest.setup.js
    jest.setTimeout(5000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    test("[0] test connection success", async () => {
        await connector._exec(StandardCommand.StdTestConnection,
            context,
            undefined,
            new PassThrough({ objectMode: true })
                .on('data', (chunk: StdTestConnectionOutput) => {
                    expect(chunk).not.toBeNull();
                    expect(chunk).not.toBeUndefined()
                    expect(chunk).toStrictEqual({});
                })
        )
    })
});

/**
 * Create Account
 */
describe("Create User Account", () => {
    // jest.setup.js
    jest.setTimeout(50000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    const userName = "testuser-" + createUUID();
    const email = userName + "@example.com"

    let plan = {
        identity: "",
        attributes: {
            userName: userName,
            email: email,
            jobTitle: "SOE",
            company: "Acme",
            groups: ["8275323", "8265840"]
        }
    } as StdAccountCreateInput;

    test("[0] create user success", async () => {
        await connector._exec(
            StandardCommand.StdAccountCreate,
            context,
            plan,
            new PassThrough({ objectMode: true })
                .on('data', (chunk: StdAccountCreateOutput) => {
                    expect(chunk).not.toBeNull();
                    expect(chunk).not.toBeUndefined();
                    expect(chunk.identity).not.toBeNull()
                    expect(chunk.identity).not.toBeUndefined()
                    expect(chunk.attributes).not.toBeNull();
                    expect(chunk.attributes).not.toBeUndefined();
                    expect(chunk.attributes.userName).toStrictEqual(userName);
                    expect(chunk.attributes.email).toStrictEqual(email);
                    expect(chunk.attributes.groups).not.toBeNull();
                    expect(chunk.attributes.groups).not.toBeUndefined();
                    expect((chunk.attributes.groups as Array<String>).length).toBe(2);
                })
        );
    });
});

/**
 * Read an account
 */
describe("Read Account", () => {
    // jest.setup.js
    jest.setTimeout(50000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    let nativeIdentifier = { identity: docusignUserId } as StdAccountReadInput;

    test("[0] read account success", async () => {
        await connector._exec(StandardCommand.StdAccountRead,
            context,
            nativeIdentifier,
            new PassThrough({ objectMode: true })
                .on('data', (chunk: StdAccountReadOutput) => {
                    expect(chunk).not.toBeNull();
                    expect(chunk).not.toBeUndefined();
                    expect(chunk.uuid).toStrictEqual(docusignUserId);
                    expect(chunk.attributes).not.toBeNull();
                    expect(chunk.attributes).not.toBeUndefined();
                })
        );
    });
});

/**
 * List all accounts
 */
describe("List Accounts", () => {
    // jest.setup.js
    jest.setTimeout(50000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    test("[0] list accounts success", async () => {
        let count = 0;
        await connector
            ._exec(StandardCommand.StdAccountList,
                context,
                undefined,
                new PassThrough({ objectMode: true })
                    .on('data', (chunk: StdAccountListOutput) => {
                        expect(chunk).not.toBeNull();
                        expect(chunk).not.toBeUndefined();
                        expect(chunk.identity).not.toBeNull();
                        expect(chunk.identity).not.toBeUndefined();
                        expect(chunk.attributes).not.toBeNull();
                        expect(chunk.attributes).not.toBeUndefined();
                        count++;
                    })
            );

        expect(count).toBeGreaterThanOrEqual(1);
    });
});

/**
 * Read an entitlement
 */
describe("Read Entitlement", () => {
    // jest.setup.js
    jest.setTimeout(5000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    test("[0] operation not supported", async () => {
        expect(
            connector
                ._exec(StandardCommand.StdEntitlementRead,
                    context,
                    undefined,
                    new PassThrough({ objectMode: true })))
            .rejects
            .toThrowError('Operation not supported.')
    });
});

/**
 * List all entitlements
 */
describe("List Entitlements", () => {
    // jest.setup.js
    jest.setTimeout(50000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    test("[0] list groups success", async () => {
        let count = 0;
        await connector
            ._exec(
                StandardCommand.StdEntitlementList,
                context,
                undefined,
                new PassThrough({ objectMode: true })
                    .on('data', (chunk: StdEntitlementListOutput) => {
                        expect(chunk).not.toBeNull();
                        expect(chunk).not.toBeUndefined();
                        expect(chunk.identity).not.toBeNull();
                        expect(chunk.identity).not.toBeUndefined();
                        expect(chunk.attributes).not.toBeNull();
                        expect(chunk.attributes).not.toBeUndefined();
                        count++;
                    })
            );

        expect(count).toBeGreaterThanOrEqual(1);
    });
});

/**
 * Update an account
 */
describe("Update Account", () => {
    // jest.setup.js
    jest.setTimeout(50000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    const company = "FOX TV";

    const plan = {
        identity: docusignUserId,
        changes: [
            {
                op: "Add",
                attribute: "groups",
                value: "8265840"
            },
            {
                op: "Add",
                attribute: "jobTitle",
                value: "Editor"
            },
            {
                op: "Add",
                attribute: "company",
                value: company
            }
        ]
    } as StdAccountUpdateInput;

    test("[0] update account attributes", async () => {
        await connector._exec(
            StandardCommand.StdAccountUpdate,
            context,
            plan,
            new PassThrough({ objectMode: true })
                .on('data', (chunk: StdAccountCreateOutput) => {
                    expect(chunk).not.toBeNull();
                    expect(chunk).not.toBeUndefined();
                    expect(chunk.identity).not.toBeNull()
                    expect(chunk.identity).not.toBeUndefined()
                    expect(chunk.identity).toStrictEqual(docusignUserId);
                    expect(chunk.attributes).not.toBeNull();
                    expect(chunk.attributes).not.toBeUndefined();
                    expect(chunk.attributes.groups).not.toBeNull();
                    expect(chunk.attributes.groups).not.toBeUndefined();
                    expect((chunk.attributes.groups as Array<String>).length).toBeGreaterThanOrEqual(1);
                    expect(chunk.attributes.company).toStrictEqual(company)
                })
        );
    });
});

/**
 * Delete user account
 */
describe("Delete User Account", () => {
    // jest.setup.js
    jest.setTimeout(50000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    let plan = {
        identity: docusignUserId,
    } as StdAccountDeleteInput;

    test("[0] delete user success", async () => {
        await connector._exec(
            StandardCommand.StdAccountDelete,
            context,
            plan,
            new PassThrough({ objectMode: true })
                .on('data', (chunk: StdAccountReadOutput) => {
                    expect(chunk).not.toBeNull();
                    expect(chunk).not.toBeUndefined()
                    expect(chunk).toStrictEqual({});
                })
        );

        let nativeIdentifier = { identity: docusignUserId } as StdAccountReadInput;
        await connector._exec(
            StandardCommand.StdAccountRead,
            context,
            nativeIdentifier,
            new PassThrough({ objectMode: true })
                .on('data', (chunk: StdAccountReadOutput) => {
                    expect(chunk).not.toBeNull();
                    expect(chunk).not.toBeUndefined();
                    expect(chunk.identity).not.toBeNull();
                    expect(chunk.identity).not.toBeUndefined();
                    expect(chunk.identity).toStrictEqual(docusignUserId);
                    expect(chunk.attributes).not.toBeNull();
                    expect(chunk.attributes).not.toBeUndefined();
                    expect(chunk.attributes.userStatus).toStrictEqual("Closed"); // deleted user is disabled in docusign
                })
        );
    });
});
