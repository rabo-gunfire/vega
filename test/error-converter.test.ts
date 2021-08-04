/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ResponseError } from "superagent";
import { convertToConnectorError } from "../src/tools/error-converter";

/////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////

describe("http errors", () => {
    test("[0] 400", () => {
        let error = new Error("Bad Request") as ResponseError;
        error.status = 400;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError("400 Bad Request");
    });

    test("[1] 401", () => {
        let error = new Error("Unauthorized") as ResponseError;
        error.status = 401;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError("401 Unauthorized");
    });

    test("[2] 403", () => {
        let error = new Error("Forbidden") as ResponseError;
        error.status = 403;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError("403 Forbidden");
    });

    test("[3] 404", () => {
        let error = new Error("Not Found") as ResponseError;
        error.status = 404;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError("404 Not Found");
    });

    test("[3] 404", () => {
        let error = new Error("Too Many Requests") as ResponseError;
        error.status = 429;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError("429 Too Many Requests");
    });
});

describe("wire errors", () => {
    test("[0] host not found", () => {

        let error = {
            errno: -3008,
            code: "ENOTFOUND",
            syscall: "getaddrinfo",
            hostname: "demo.docusign1.net",
            message: "getaddrinfo ENOTFOUND demo.docusign1.net"
        }

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError("Unknown host. message: getaddrinfo ENOTFOUND demo.docusign1.net");
    });
});

describe("regular errors", () => {
    test("[0] user not found", () => {

        let error = new Error("User not found");

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError("User not found");
    });
});

describe("other errors", () => {
    test("[1] random error", () => {
        let error = "User already exists"

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError("User already exists");
    });
});
