/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import {
    AttributeChange,
    Context,
    ResponseStream,
    StandardCommand,
    StdAccountCreateInput,
    StdAccountDeleteInput,
    StdAccountReadInput,
    StdAccountUpdateInput,
    StdAccountUpdateOutput
} from '@sailpoint/connector-sdk';

import { rejects } from 'assert';
import { PassThrough } from 'stream';

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

process.env.CONNECTOR_CONFIG = Buffer.from(JSON.stringify(config), 'utf-8').toString('base64');

import { connector } from '../src/index';

// Integration tests shouldn't mock anything.
jest.unmock("superagent");

/**
 * Test the connection
 */
describe("test connection", () => {
    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
    });

    // jest.setup.js
    jest.setTimeout(50000);

    test("0", async () => {
        await connector._exec(StandardCommand.StdTestConnection,
            context,
			undefined,
			new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk).toStrictEqual({}))
		)
    })
});

/**
 * Read an account
 */
// describe("Read Account", () => {
//     // jest.setup.js
//     jest.setTimeout(50000);

//     afterAll(async () => {
//         await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
//     });

//     let nativeIdentifier: StdAccountReadInput = { identity: '34bade63-d863-4d12-a40d-5acd5a11fed0' } as StdAccountReadInput;
//     test("0", async () => {
//         await connector._exec(StandardCommand.StdAccountRead,
//             context,
// 			nativeIdentifier,
// 			new PassThrough({ objectMode: true })
//             .on('data', (chunk) => expect(chunk?.uuid).toStrictEqual('34bade63-d863-4d12-a40d-5acd5a11fed0'))
// 		)
//     })
// });

/**
 * List all accounts
 */
// describe("List Accounts", () => {
//     // jest.setup.js
//     jest.setTimeout(50000);

//     afterAll(async () => {
//         await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
//     });

//     test("0", async () => {
//         await connector._exec(StandardCommand.StdAccountList,
//             context,
// 			undefined,
// 			new PassThrough({ objectMode: true })
// 		)
//     })
// });

/**
 * Read an entitlement
 */
// describe("Read Entitlement", () => {
//     test("[0] errored?", async () => {
//         expect(connector._exec (
//             StandardCommand.StdEntitlementRead,
//             context,
//             undefined,
//             new PassThrough({ objectMode: true })
//         )).rejects.toThrow();
//     })

//     test("[1] operation not supported", async () => {
//         expect(connector._exec (
//             StandardCommand.StdEntitlementRead,
//             context,
//             undefined,
//             new PassThrough({ objectMode: true })
//         )).rejects.toThrowError('Operation not supported.')
//     })
// });

/**
 * List all entitlements
 */
// describe("List Entitlements", () => {
//     // jest.setup.js
//     jest.setTimeout(50000);

//     afterAll(async () => {
//         await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
//     });

//     test("[0] list groups", async () => {
//         await connector._exec(
//             StandardCommand.StdEntitlementList,
//             context,
//             undefined,
//             new PassThrough({ objectMode: true })
//         )
//     })
// });

/**
 * Create Account
 */
// describe("Create User Account", () => {
//     // jest.setup.js
//     jest.setTimeout(50000);

//     afterAll(async () => {
//         await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
//     });

//     let plan = {
//         identity: 'fake-6.user',
//         attributes: {
//             firstName: 'fake-6',
//             lastName: 'user',
//             jobTitle: 'SOE',
//             email: 'fake-6.user@fakemail.com',
//             company: 'Acme',
//             groups: ['8275323', '8267667']
//         }
//     } as StdAccountCreateInput;

//     test("[0] add user", async () => {
//         await connector._exec(
//             StandardCommand.StdAccountCreate,
//             context,
//             plan,
//             new PassThrough({ objectMode: true })
//         )
//     })
// });

/**
 * Update an account
 */
// describe("Update Account", () => {
//     // jest.setup.js
//     jest.setTimeout(50000);

//     afterAll(async () => {
//         await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
//     });

//     const plan = {
//         identity: '63f54b3f-f437-4722-9947-1452dd3009a4',
//         changes: [
//             {
//                 op: 'Add',
//                 attribute: 'groups',
//                 value: '8275323'
//             },
//             {
//                 op: 'Add',
//                 attribute: 'jobTitle',
//                 value: 'PSEX'
//             },
//             {
//                 op: 'Add',
//                 attribute: 'company',
//                 value: 'FOOX'
//             }
//         ]
//     } as StdAccountUpdateInput;

//     test("[0] update account attributes", async () => {
//         await connector._exec(
//             StandardCommand.StdAccountUpdate,
//             context,
//             plan,
//             new PassThrough({ objectMode: true })
//         )
//     })
// });

/**
 * Delete user account
 */
// describe("Delete User Account", () => {
//     // jest.setup.js
//     jest.setTimeout(50000);

//     afterAll(async () => {
//         await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
//     });


//     let plan = {
//         identity: '542892d7-4033-4563-90a0-c462c10eddcb',
//     } as StdAccountDeleteInput;

//     test("[0] add user", async () => {
//         await connector._exec(
//             StandardCommand.StdAccountDelete,
//             context,
//             plan,
//             new PassThrough({ objectMode: true })
//         )
//     })
// });
