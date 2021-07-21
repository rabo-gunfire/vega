/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import {
    AttributeChange,
    Context,
    ResponseStream,
    StandardCommand,
    StdAccountCreateInput,
    StdAccountDeleteInput,
    StdAccountReadInput,
    StdAccountUpdateOutput
} from '@sailpoint/connector-sdk';

import { rejects } from 'assert';
import { PassThrough } from 'stream';

// initialize app configuration context
const context: Context = {
    config: {
        apiUrl: 'https://demo.docusign.net',
        oauthServerUrl: 'https://account-d.docusign.com',
        accountId: '14072015',
        clientId: 'df45eb70-ba0f-4106-9e0f-ce83fdb4d4a9',
        clientSecret: '403ab462-76b8-4037-af7b-094eec3bd338',
        refreshToken: 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAgABwCA5oP4OzbZSAgAgGbo8M5N2UgCAGPeujRj2BJNpA1azVoR_tAVAAEAAAAYAAEAAAAFAAAADQAkAAAAZGY0NWViNzAtYmEwZi00MTA2LTllMGYtY2U4M2ZkYjRkNGE5IgAkAAAAZGY0NWViNzAtYmEwZi00MTA2LTllMGYtY2U4M2ZkYjRkNGE5MAAAFhgbsizZSDcAJrckfLbkskWwVEu_I6YOXQ.BIvZBgvAXLdM7dhbSCZxUMgQKBP5n60m7z39HPb0pWPTry5cUaPQr5yMzQdBzkebFhuCcLmGHJl-5S-kz8vpmwsE_1JCPOxU-j2TDWYtsoqnmSYKhA_t2CXGWOr84ac1_ZpgWtL5QVzUfK8ypW-NB8yVkAS3y3whQ22hk9noe-i6OhF1pPYV20p37ezK-_K5ITLBA4CH8TJR4XvXWTbzJvRXwaJPbaW70mQf2df_Yk_7iFhy3gbfq-w-jwk9wV4c3qOi1semgflQR8vARyaE_NGT7FJJA0oow_kAQbXheR39ALoQEPfFdGwkwK9wXg326Fc1kUrZlKtOqQOvfSU2pw'
    },
    id: "eyJ0eXAiOiJNVCIs-101",
    name: "DocuSign eSignature",
    version: 1.0
}

process.env.CONNECTOR_CONFIG = Buffer.from(JSON.stringify(context.config), 'utf-8').toString('base64');

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
//         identity: 'test4.fakeuser',
//         attributes: {
//             firstName: 'test4',
//             lastName: 'fakeuser',
//             jobTitle: 'SOE',
//             email: 'test4@fakemail.com',
//             company: 'Acme',
//             group: ['8275323', '8267667']
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
//         identity: '542892d7-4033-4563-90a0-c462c10eddcb',
//         changes: [
//             {
//                 op: 'Add',
//                 attribute: 'email',
//                 value: 'test33@fakemail.com'
//             },
//             {
//                 op: 'Add',
//                 attribute: 'jobTitle',
//                 value: 'SOEEE'
//             },
//             {
//                 op: 'Add',
//                 attribute: 'userName',
//                 value: 'test33.fakeuser'
//             },
//         ]
//     } as StdAccountUpdateOutput;

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
