/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import {
    Context,
    StandardCommand,
    StdAccountCreateInput,
    StdAccountCreateOutput,
    StdAccountDeleteInput,
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
    accountId: '14072015',
    clientId: 'df45eb70-ba0f-4106-9e0f-ce83fdb4d4a9',
    userId: '34bade63-d863-4d12-a40d-5acd5a11fed0',
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAgxhIk1YpLE9JLnuEcUEfulDULGkYT4qGzRJdRCIdsLiEgkD4
d3nIfQwYzdN6pwh4wMOiN8EmBwxXCXSbd7OtBSw3maJSpvH6ceQCSkoIZFNBvYKG
a1deIilhA8Y/c+IZYdZQxIBC8aNoO0zHlI9Y/sSeaisRjyQE8Ovj3Vb9PRfcCZkz
m+fB3yMGSZqCLO0QN4gE5SPt1PotM9BDnmMeADfLu0CvmsP4tJ01fgLXAyjsbghY
1nySxTjPRWgNafXVe6nXN4SCn9VnVKsmCCQ/LNyFSIa3CZeBicCV3ngq+Fy7/opm
sfLNrhKbAyCR0NDzuq7jvGFT81k5lTF/UCZndwIDAQABAoIBAG+ORYwjYMwU+Ch2
8YBSs8YfrD3SfN6K+iUeQIGPKobMre4NjaJV3tcSaTUVhiUHn4IhuDQLx+lthc9F
DFszacOiGfpB2GW6Oq2aIpzHHRcKhkHXBb3oTfFyFt1YYXyiZYkNEBP3NYBc1oDH
2HpB9bBu7oNX/Qw60X2WroQW106ZbtSy+VlawyECoSGriZ6hXiGKpjU4EK0Eu9Mi
qyvX08Z0ysOukxnZK3ElVEFpHSXgvGwYSsSBPTmtGdja8jvBC3dCulyYxvLjBmiT
sUZD+P4JaccscgxRNdA9BZBy131BAGx5ZbvfArFjKMpuk2w82h7zjEw/8f8zrG1O
jPG2myECgYEA9a8NhunJORrtcM+qLNdvoiHd3/NQeftng4LKYdDfZYhpfGOAtvPY
5P3oOLdUmoeWf9DW4qBZTiluQP+jhu0fnbrfwSHwj83HGGGUBH8uA+GZTWtRdzYh
aEhcc0DCvUHdIOJ4/KfDqmYaL+7e+iF40NH2m53xjiOiR3VzOQQUAacCgYEAiJl4
oQME8y5pv4XOcPxLbtCeDMNhInUwXr/0AqYqeyc4LlqvqHvlaUIeDMBzJYM3KEOo
01wtlp/+mCRa+V8++47o3J7hMVHjcmJpKoOSVb5eYVgyVC5HzeJaX1b+BoQ3y7Sk
sx389mnAZYuGpWIpH/L9cY6Z3X4Ntu0/1iKPBbECgYEAiZ0tAYXQHXl0yDy5wHZH
5FP9+KRMTpdAawyGmfWqPDAFjhQaE+BQfCuwuJwP+qK57QwoYTaZ70sLo8LNcRU/
IVV8YazGF3aW75Qwmbg3KRtjiFb1gcXDPqtRhYkfy2yqFPJl/HdoBPk9791n7klz
Z9xDuvTkSc6x5j7mdGhRYH8CgYAz85KCQiC20DcdxSkPpZSWz7bcic4+ia1cy8pk
24eakP73+juGa6CDmMbO+L6STMZEhP8Ha65W9ACjImiLISNWDzMW/UIOPOOxFCaF
KccU3zML+LwjcfqTHfxa+D3igpSp38kn6kbT/MJUnG0YJy4W3ZZwgtiX+aIDqVW2
/ivA8QKBgBn+AGns2YIA4GyabYBDTG+yvVCCc4jpHHSA12y0r53uUFMpIzQovok+
vGNZu35lvP4F6w9OD6BqE5zBMezh8c+epOyoGigREVddfP8bWTFZjOS1kdnKQgB7
zfkEG1WlCiKaKZAg/+ADmzkTEkwfYpn9oJWVP6zBgWbjSDwBjtFB
-----END RSA PRIVATE KEY-----`
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
                .on('data', (chunk: StdAccountReadOutput) => {
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
