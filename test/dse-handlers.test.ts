/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */
import { DseConnector } from "../src/connectors/dse-connector";
import {
    Connector,
    Context,
    ResponseStream,
    StandardCommand,
    StdAccountCreateInput,
    StdAccountDeleteInput,
    StdAccountReadInput,
    StdAccountUpdateInput,
    StdEntitlementReadInput
} from "@sailpoint/connector-sdk";
import { PassThrough } from "stream";
import { InvalidConfigurationError } from "../src/connectors/invalid-configuration-error";

//////////////////////////////////////////////////////////////////////
//
// COMMON CONSTANTS
//
//////////////////////////////////////////////////////////////////////
const mockContext = {
    id: "54bcaba7-5698-4471-a1b0-26274d4af74b",
    name: "DocuSign eSignature",
    version: 1.0
} as Context;
const mockInput = {};

//////////////////////////////////////////////////////////////////////
//
// DseConnector MOCKS
//
//////////////////////////////////////////////////////////////////////
const operationSuccess = (): void => {
    return;
};
const operationFailsWithConnectorError = (): void => {
    throw new InvalidConfigurationError("Token expired");
};
const operationFailsWithOtherError = (): void => {
    throw new Error("All hell broke loose.");
};

jest.mock("../src/connectors/dse-connector", () => {
    return {
        DseConnector: jest.fn().mockImplementation(() => {
            return {
                testConnection: jest.fn().mockImplementationOnce(() => {
                    operationSuccess();
                }).mockImplementationOnce(() => {
                    operationFailsWithConnectorError();
                }).mockImplementationOnce(() => {
                    operationFailsWithOtherError();
                }),
                readAccount: jest.fn().mockImplementationOnce(() => {
                    operationSuccess();
                }).mockImplementationOnce(() => {
                    operationFailsWithConnectorError();
                }).mockImplementationOnce(() => {
                    operationFailsWithOtherError();
                }),
                listAccounts: jest.fn().mockImplementationOnce(() => {
                    operationSuccess();
                }).mockImplementationOnce(() => {
                    operationFailsWithConnectorError();
                }).mockImplementationOnce(() => {
                    operationFailsWithOtherError();
                }),
                listEntitlements: jest.fn().mockImplementationOnce(() => {
                    operationSuccess();
                }).mockImplementationOnce(() => {
                    operationFailsWithConnectorError();
                }).mockImplementationOnce(() => {
                    operationFailsWithOtherError();
                }),
                createAccount: jest.fn().mockImplementationOnce(() => {
                    operationSuccess();
                }).mockImplementationOnce(() => {
                    operationFailsWithConnectorError();
                }).mockImplementationOnce(() => {
                    operationFailsWithOtherError();
                }),
                updateAccount: jest.fn().mockImplementationOnce(() => {
                    operationSuccess();
                }).mockImplementationOnce(() => {
                    operationFailsWithConnectorError();
                }).mockImplementationOnce(() => {
                    operationFailsWithOtherError();
                }),
                deleteAccount: jest.fn().mockImplementationOnce(() => {
                    operationSuccess();
                }).mockImplementationOnce(() => {
                    operationFailsWithConnectorError();
                }).mockImplementationOnce(() => {
                    operationFailsWithOtherError();
                })
            };
        })
    };
});

//////////////////////////////////////////////////////////////////////
//
// readConfig MOCKS
//
//////////////////////////////////////////////////////////////////////
const mockConfig = {
    apiUrl: "https://fakeapi.acme.org/restapi",
    oauthServerUrl: "https://fakeorg-d.org",
    accountId: '14072015',
    clientId: "b'nXQpVsglEGFJgfK'",
    clientSecret: "clS3cRet",
    refreshToken: "r4fesh'Tonaken"
};

jest.mock('@sailpoint/connector-sdk', () => {
    return {
        readConfig: jest.fn().mockImplementationOnce(() => {
            return mockConfig;
        }),
        ResponseStream: jest.fn().mockImplementationOnce(() => {
        }),
        Connector: jest.fn().mockImplementation(() => {
            return {
                stdTestConnection: jest.fn().mockReturnThis(),
                stdAccountRead: jest.fn().mockReturnThis(),
                stdAccountList:jest.fn().mockReturnThis(),
                stdEntitlementRead: jest.fn().mockReturnThis(),
                stdEntitlementList: jest.fn().mockReturnThis(),
                stdAccountCreate: jest.fn().mockReturnThis(),
                stdAccountUpdate: jest.fn().mockReturnThis(),
                stdAccountDelete: jest.fn().mockReturnThis(),
                _exec: jest.fn().mockReturnThis(),
            }
        }),
        createConnector: jest.fn().mockImplementationOnce(() => {
            return new Connector();
        }),
        StandardCommand: {
            StdTestConnection: 'std:test-connection',
        }
    };
});

import * as dseHandler from "../src/connectors/dse-handlers";
import { DseConfig } from "../src/connectors/dse-config";
import { connector } from '../src/index';

//////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////

describe("DseConnector constructor", () => {
    let inst: DseConnector;

    beforeEach(() => {
        inst = new DseConnector(mockConfig);
    });

    test("[0] DseConnector called", async () => {
        expect(DseConnector).toHaveBeenCalled();
        expect(DseConnector).toHaveBeenCalledTimes(1);
    });

    test("[1] DseConnector called with", async () => {
        expect(DseConnector).toHaveBeenCalledWith(mockConfig);
    });
});

describe("stdTestConnectionHandler", () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test("[0] test connection success", () => {
        expect(dseHandler.stdTestConnectionHandler(mockContext, undefined, res))
            .resolves
            .toBeUndefined();
    });

    test("[1] connector error in test", async () => {

        expect(dseHandler.stdTestConnectionHandler(mockContext, undefined, res))
            .rejects
            .toThrowError("Token expired");
    });

    test("[2] unknown error in test", async () => {
        expect(dseHandler.stdTestConnectionHandler(mockContext, undefined, res))
            .rejects
            .toThrowError("All hell broke loose.");
    });
});

describe("stdAccountReadHandler", () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test("[0] read account success", () => {
        expect(dseHandler.stdAccountReadHandler(mockContext, mockInput as StdAccountReadInput, res))
            .resolves
            .toBeUndefined();
    });

    test("[1] connector error in read account", async () => {
        expect(dseHandler.stdAccountReadHandler(mockContext, mockInput as StdAccountReadInput, res))
            .rejects
            .toThrowError("Token expired");
    });

    test("[2] unknown error in read account", async () => {
        expect(dseHandler.stdAccountReadHandler(mockContext, mockInput as StdAccountReadInput, res))
            .rejects
            .toThrowError("All hell broke loose.");
    });
});

describe("stdAccountListHandler", () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test("[0] list account success", () => {
        expect(dseHandler.stdAccountListHandler(mockContext, undefined, res))
            .resolves
            .toBeUndefined();
    });

    test("[1] connector error in list account", async () => {
        expect(dseHandler.stdAccountListHandler(mockContext, undefined, res))
            .rejects
            .toThrowError("Token expired");
    });

    test("[2] unknown error in list account", async () => {
        expect(dseHandler.stdAccountListHandler(mockContext, undefined, res))
            .rejects
            .toThrowError("All hell broke loose.");
    });
});

describe("stdEntitlementReadHandler", () => {
    let res = new ResponseStream<any>(new PassThrough({ objectMode: true }));

    test("[0] list account success", () => {
        expect(dseHandler.stdEntitlementReadHandler(mockContext, mockInput as StdEntitlementReadInput, res))
            .rejects
            .toThrowError("Operation not supported.");
    });
});

describe("stdEntitlementListHandler", () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test("[0] list entitlement success", () => {
        expect(dseHandler.stdEntitlementListHandler(mockContext, undefined, res))
            .resolves
            .toBeUndefined();
    });

    test("[1] connector error in list entitlement", async () => {
        expect(dseHandler.stdEntitlementListHandler(mockContext, undefined, res))
            .rejects
            .toThrowError("Token expired");
    });

    test("[2] unknown error in list entitlement", async () => {
        expect(dseHandler.stdEntitlementListHandler(mockContext, undefined, res))
            .rejects
            .toThrowError("All hell broke loose.");
    });
});

describe("stdAccountCreateHandler", () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test("[0] account create success", () => {
        expect(dseHandler.stdAccountCreateHandler(mockContext, mockInput as StdAccountCreateInput, res))
            .resolves
            .toBeUndefined();
    });

    test("[1] connector error in account creation", async () => {
        expect(dseHandler.stdAccountCreateHandler(mockContext, mockInput as StdAccountCreateInput, res))
            .rejects
            .toThrowError("Token expired");
    });

    test("[2] unknown error in account creation", async () => {
        expect(dseHandler.stdAccountCreateHandler(mockContext, mockInput as StdAccountCreateInput, res))
            .rejects
            .toThrowError("All hell broke loose.");
    });
});

describe("stdAccountUpdateHandler", () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test("[0] account update success", () => {
        expect(dseHandler.stdAccountUpdateHandler(mockContext, mockInput as StdAccountUpdateInput, res))
            .resolves
            .toBeUndefined();
    });

    test("[1] connector error in account update", async () => {
        expect(dseHandler.stdAccountUpdateHandler(mockContext, mockInput as StdAccountUpdateInput, res))
            .rejects
            .toThrowError("Token expired");
    });

    test("[2] unknown error in account update", async () => {
        expect(dseHandler.stdAccountUpdateHandler(mockContext, mockInput as StdAccountUpdateInput, res))
            .rejects
            .toThrowError("All hell broke loose.");
    });
});

describe("stdAccountDeleteHandler", () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test("[0] account update success", () => {
        expect(dseHandler.stdAccountDeleteHandler(mockContext, mockInput as StdAccountDeleteInput, res))
            .resolves
            .toBeUndefined();
    });

    test("[1] connector error in account delete", async () => {
        expect(dseHandler.stdAccountDeleteHandler(mockContext, mockInput as StdAccountDeleteInput, res))
            .rejects
            .toThrowError("Token expired");
    });

    test("[2] unknown error in account delete", async () => {
        expect(dseHandler.stdAccountDeleteHandler(mockContext, mockInput as StdAccountDeleteInput, res))
            .rejects
            .toThrowError("All hell broke loose.");
    });
});

describe("validateConfig", () => {
    test("[0] apiUrl missing error", () => {
        let mockConfig = { oauthServerUrl: "https://fakeorg-d.org", accountId: '14072015', clientId: "b'nXQpVsglEGFJgfK'", clientSecret: "clS3cRet", refreshToken: "r4fesh'Tonaken" };
        expect(() => {
            dseHandler.validateConfig(mockConfig as DseConfig);
        }).toThrowError("'apiUrl' is required");
    });

    test("[1] oauthServerUrl missing error", () => {
        let mockConfig = { apiUrl: "https://fakeapi.acme.org/restapi", accountId: '14072015', clientId: "b'nXQpVsglEGFJgfK'", clientSecret: "clS3cRet", refreshToken: "r4fesh'Tonaken" };
        expect(() => {
            dseHandler.validateConfig(mockConfig as DseConfig);
        }).toThrowError("'oauthServerUrl' is required");
    });

    test("[2] accountId missing error", () => {
        let mockConfig = { apiUrl: "https://fakeapi.acme.org/restapi", oauthServerUrl: "https://fakeorg-d.org", clientId: "b'nXQpVsglEGFJgfK'", clientSecret: "clS3cRet", refreshToken: "r4fesh'Tonaken" };
        expect(() => {
            dseHandler.validateConfig(mockConfig as DseConfig);
        }).toThrowError("'accountId' is required");
    });

    test("[3] clientId missing error", () => {
        let mockConfig = { apiUrl: "https://fakeapi.acme.org/restapi", oauthServerUrl: "https://fakeorg-d.org", accountId: '14072015', clientSecret: "clS3cRet", refreshToken: "r4fesh'Tonaken" };
        expect(() => {
            dseHandler.validateConfig(mockConfig as DseConfig);
        }).toThrowError("'clientId' is required");
    });

    test("[4] clientSecret missing error", () => {
        let mockConfig = { apiUrl: "https://fakeapi.acme.org/restapi", oauthServerUrl: "https://fakeorg-d.org", accountId: '14072015', clientId: "b'nXQpVsglEGFJgfK'", refreshToken: "r4fesh'Tonaken" };
        expect(() => {
            dseHandler.validateConfig(mockConfig as DseConfig)
        }).toThrowError("'clientSecret' is required");
    });

    test("[5] refreshToken missing error", () => {
        let mockConfig = { apiUrl: "https://fakeapi.acme.org/restapi", oauthServerUrl: "https://fakeorg-d.org", accountId: '14072015', clientId: "b'nXQpVsglEGFJgfK'", clientSecret: "clS3cRet" };
        expect(() => {
            dseHandler.validateConfig(mockConfig as DseConfig)
        }).toThrowError("'refreshToken' is required");
    });
});

describe("connector test from index js", () => {
    test("[0] test connection", () => {
        connector._exec(StandardCommand.StdTestConnection,
            mockContext,
            undefined,
            new PassThrough({ objectMode: true })
        )
    });
});
