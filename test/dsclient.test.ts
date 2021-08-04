/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import * as dsclient from "../src/docusign/dsclient";

//////////////////////////////////////////////////////////////////////
//
// ApiClient MOCKS
//
//////////////////////////////////////////////////////////////////////

/* Mock docusign-esign ApiClient */
jest.mock("docusign-esign/src/ApiClient", () => {
    return jest.fn().mockImplementation(() => ({
        ...jest.requireActual("docusign-esign/src/ApiClient"),

        getUserInfo: jest.fn().mockImplementation(() => {
            return {
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
            };
        }),

        addDefaultHeader: jest.fn().mockImplementation()
    }));
});

//////////////////////////////////////////////////////////////////////
//
// SUPERAGENT MOCKS
//
//////////////////////////////////////////////////////////////////////

const Request = require('../src/docusign/__mocks__/superagent.js');

//////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////

describe("dsClient", () => {
    let inst: dsclient.DocuSignClient;
    beforeEach(() => {
        inst = new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access");
    })

    test("[1] ds api client to be defined", async () => {
        expect(inst.dsApiClient).toBeDefined();
    });
});

describe("getTokenUserInfo", () => {
    let inst: dsclient.DocuSignClient;

    beforeEach(() => {
        inst = new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access");
    })

    test("[0] user info", async () => {
        let result: any = await inst.getTokenUserInfo();
        expect(result.sub).toStrictEqual("34bade63-d863-4d12-a40d-5acd5a11fed0");
    })
});

describe("refreshAccessToken", () => {
    let inst: dsclient.DocuSignClient;

    beforeEach(() => {
        inst = new dsclient.DocuSignClient("https://fakeapi.acme.org/restapi", "https://fakeorg-d.org", "b'nXQpVsglEGFJgfK'", "S3cRet", "access");
    })

    test("[0] access token success", () => {
        Request.__setMockResponse({
            ok: true,
            status: 200,
            body: {
                access_token: "eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAUABwCA29axPUzZSAgAgBv6v4BM2UgCAGPeujRj2BJNpA1azVoR_tAVAAEAAAAYAAEAAAAFAAAADQAkAAAAZGY0NWViNzAtYmEwZi00MTA2LTllMGYtY2U4M2ZkYjRkNGE5IgAkAAAAZGY0NWViNzAtYmEwZi00MTA2LTllMGYtY2U4M2ZkYjRkNGE5MAAAFhgbsizZSDcAJrckfLbkskWwVEu_I6YOXQ.We_MUVqllChw-jXzFAP6T_wHLYB4dBFyRPkfDGQ5Pc48fwSnrdnmWYclbQgkXdQ7tszNVBWcNRFGMcuSemUbi68Z2YI3-RW0tF77u1pQSiBb6WtRiMIx9GzhiKZ45rQp6GBbSYmmV0ihgWGyXMOxfFLxoWj-MH53hqNXMkNUXatDBODZku09S320VjXXCzwJ4s4JUfg9_-uEYNH_EFAX7Gee2lHfX8sNG6iltFTJuQ40i83gOpUXN8i4gME0gdViN0OMOW3NXVeNKQyaa4J6bfE3k1A0LnGUIFYWrC5KsLfcSH9uA-1vNH3tHxO9XZWbj6jpEuRpXan0U7y2XEhflQ",
                token_type: "Bearer",
                refresh_token: "eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAgABwCA29axPUzZSAgAgFs7qtBj2UgCAGPeujRj2BJNpA1azVoR_tAVAAEAAAAYAAEAAAAFAAAADQAkAAAAZGY0NWViNzAtYmEwZi00MTA2LTllMGYtY2U4M2ZkYjRkNGE5IgAkAAAAZGY0NWViNzAtYmEwZi00MTA2LTllMGYtY2U4M2ZkYjRkNGE5MAAAFhgbsizZSDcAJrckfLbkskWwVEu_I6YOXQ.NT_2gCtUUEDCxJUNvcS8WNYWYuYGwyme9WzvBLjXRUFWYT6AHV_9XYENPtPhzVV3NDz85ZF1wXFTOtUfrPKEgrZHuKLfJ0CxXnNdgm1M1I-EQz8k-ORWu65AJTgGSXepLXVjiNf5Cr-4UXn70ZnqOsa8g_1l70kfAa7og1j50gLAZawuRo-2bjufv42d5AqV756u4ac0rOVlBsDB6XeWfcw1ZBwUdbsh2ZzafCMY6xIOv_92_VyR8qU6_otnxCd6cO6XGc8OfoVDzW8kPP3woZpaN6VA7TcRFH5fkAlTnf1k3nfTI6mwAVjl-ehA4y1H4b_OqOyzH1ewmzzFG64dZw",
                expires_in: 28800
            }
        });

        return inst.refreshAccessToken();
    });

    test("[1] access token is undefined", () => {
        Request.__setMockResponse({
            ok: true,
            status: 200,
            body: {
                access_token: "",
                token_type: "Bearer",
                refresh_token: "eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAgABwCA29axPUzZSAgAgFs7qtBj2UgCAGPeujRj2BJNpA1azVoR_tAVAAEAAAAYAAEAAAAFAAAADQAkAAAAZGY0NWViNzAtYmEwZi00MTA2LTllMGYtY2U4M2ZkYjRkNGE5IgAkAAAAZGY0NWViNzAtYmEwZi00MTA2LTllMGYtY2U4M2ZkYjRkNGE5MAAAFhgbsizZSDcAJrckfLbkskWwVEu_I6YOXQ.NT_2gCtUUEDCxJUNvcS8WNYWYuYGwyme9WzvBLjXRUFWYT6AHV_9XYENPtPhzVV3NDz85ZF1wXFTOtUfrPKEgrZHuKLfJ0CxXnNdgm1M1I-EQz8k-ORWu65AJTgGSXepLXVjiNf5Cr-4UXn70ZnqOsa8g_1l70kfAa7og1j50gLAZawuRo-2bjufv42d5AqV756u4ac0rOVlBsDB6XeWfcw1ZBwUdbsh2ZzafCMY6xIOv_92_VyR8qU6_otnxCd6cO6XGc8OfoVDzW8kPP3woZpaN6VA7TcRFH5fkAlTnf1k3nfTI6mwAVjl-ehA4y1H4b_OqOyzH1ewmzzFG64dZw",
                expires_in: 28800,
            }
        });

        expect(inst.refreshAccessToken()).rejects.toThrowError('Found empty response in token generation.');
    });

    test("[2] access token promise reject", () => {
        Request.__setMockResponse({});
        Request.__setMockError( { ok: false, status: 403, body: { text: "Forbidden" } } );

        expect(inst.refreshAccessToken()).rejects.toThrowError('Failed to generate an access token.');
    });
});
