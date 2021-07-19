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
    name: "test connection",
    version: 1.0
}

process.env.CONNECTOR_CONFIG = Buffer.from(JSON.stringify(context.config), 'utf-8').toString('base64');

import { connector } from '../src/index';

// test connection
describe("test connection", () => {
    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
    });

    // jest.setup.js
    jest.setTimeout(30000);

    test("0", async () => {
        await connector._exec(StandardCommand.StdTestConnection,
            context,
			undefined,
			new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk).toStrictEqual({}))
		)
    })   
});

// // read account
// describe("read account", () => {
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

// // list account
// describe("list account", () => {
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

// // Read entitlement
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

// // list account
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

// update account
// describe("Update Account", () => {
//     // jest.setup.js
//     jest.setTimeout(50000);

//     afterAll(async () => {
//         await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
//     });


//     let plan: StdAccountUpdateOutput = {
//         identity: 'f765915c-6fab-417e-a34e-07e61a4e01ba',
//         changes: [
//             {
//                 op: 'Add',
//                 attribute: 'group',
//                 value: '8275323'
//             },
//             {
//                 op: 'Add',
//                 attribute: 'jobTitle',
//                 value: 'SOE'
//             }
//         ]
//     } as StdAccountUpdateOutput;

//     test("[0] add group", async () => {
//         await connector._exec(
//             StandardCommand.StdAccountUpdate,
//             context,
//             plan,
//             new PassThrough({ objectMode: true })
//         )
//     })
// });

// describe("Create User Account", () => {
//     // jest.setup.js
//     jest.setTimeout(50000);

//     afterAll(async () => {
//         await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
//     });


//     let plan = {
//         identity: 'test4.fakeuser',
//         attributes: {
//             firstName: 'linda',
//             lastName: 'minda',
//             jobTitle: 'SOE',
//             email: 'test4@fakemail.com',
//             company: 'Acme'
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
