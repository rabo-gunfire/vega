/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import * as ConnectorError from "../src/connectors/connector-error";
import * as InsufficientPermissionError from "../src/connectors/insufficient-permission-error";
import * as InvalidConfigurationError from "../src/connectors/invalid-configuration-error";
import * as ConnectionFailedError from "../src/connectors/connection-failed-error";
import * as InvalidRequestError from "../src/connectors/invalid-request-error";
import * as InvalidResponseError from "../src/connectors/invalid-response-error";
import * as ObjectAlreadyExistError from "../src/connectors/object-already-exist-error";
import * as ObjectNotFoundError from "../src/connectors/object-not-found-error";
import * as TimeoutError from "../src/connectors/timeout-error";

describe("ConnectorError", () => {
    let inst: ConnectorError.ConnectorError;

    beforeEach(() => {
        inst = new ConnectorError.ConnectorError("Ran out of iterations", 
                { name: "/dummy_name", message: "Wait time out reached, while waiting for results", stack: "The line-by-line profiler can only be used in dev." })
    })

    test("0", () => {
        expect(inst.name).toStrictEqual("ConnectorError");
    })

    test("1", () => {
        expect(inst.message).toStrictEqual("Ran out of iterations");
    })

    test("2", () => {
        expect(inst.stack).toContain("ConnectorError: Ran out of iterations");
    })

    test("3", () => {
        expect(inst.cause?.name).toStrictEqual("/dummy_name");
    })

    test("4", () => {
        expect(inst.cause?.message).toStrictEqual("Wait time out reached, while waiting for results");
    })

    test("5", () => {
        expect(inst.cause?.stack).toStrictEqual("The line-by-line profiler can only be used in dev.");
    })
})

describe("InsufficientPermissionError", () => {
    let inst: InsufficientPermissionError.InsufficientPermissionError;

    beforeEach(() => {
        inst = new InsufficientPermissionError.InsufficientPermissionError("Insufficient permissions detected.", 
                { name: "/forbidden", message: "403 Forbidden", stack: "Access token with inadequate scope." })
    })

    test("0", () => {
        expect(inst.name).toStrictEqual("InsufficientPermissionError");
    })

    test("1", () => {
        expect(inst.message).toStrictEqual("Insufficient permissions detected.");
    })

    test("2", () => {
        expect(inst.stack).toContain("InsufficientPermissionError: Insufficient permissions detected.");
    })

    test("3", () => {
        expect(inst.cause?.name).toStrictEqual("/forbidden");
    })

    test("4", () => {
        expect(inst.cause?.message).toStrictEqual("403 Forbidden");
    })

    test("5", () => {
        expect(inst.cause?.stack).toStrictEqual("Access token with inadequate scope.");
    })
})

describe("InvalidConfigurationError", () => {
    let inst: InvalidConfigurationError.InvalidConfigurationError;

    beforeEach(() => {
        inst = new InvalidConfigurationError.InvalidConfigurationError("Unable to find your git executable - Shutdown SickBeard and EITHER <a href=\"http://code.google.com/p/sickbeard/wiki/AdvancedSettings\" onclick=\"window.open(this.href); return false;\">set git_path in your config.ini</a> OR delete your .git folder and run from source to enable updates.",
            { name: "/dummyName", message: "missing encoding", stack: "There is a mismatch" })
    })

    test("0", () => {
        expect(inst.name).toStrictEqual("InvalidConfigurationError");
    })

    test("1", () => {
        expect(inst.message).toContain("Unable to find your git executable - Shutdown SickBeard and EITHER");
    })

    test("2", () => {
        expect(inst.stack).toContain("InvalidConfigurationError: Unable to find your git executable -");
    })

    test("3", () => {
        expect(inst.cause?.name).toStrictEqual("/dummyName");
    })

    test("4", () => {
        expect(inst.cause?.message).toStrictEqual("missing encoding");
    })

    test("5", () => {
        expect(inst.cause?.stack).toStrictEqual("There is a mismatch");
    })
})

describe("ConnectionFailedError", () => {
    let inst: ConnectionFailedError.ConnectionFailedError;

    beforeEach(() => {
        inst = new ConnectionFailedError.ConnectionFailedError("Error in retrieving email.",
            { name: "dummy_name/", message: "Invalid Invitation Token.", stack: "Message originator is not the grader, or the person being graded" })
    })

    test("0", () => {
        expect(inst.name).toStrictEqual("ConnectionFailedError");
    })

    test("1", () => {
        expect(inst.message).toStrictEqual("Error in retrieving email.");
    })

    test("2", () => {
        expect(inst.stack).toContain("ConnectionFailedError: Error in retrieving email.");
    })

    test("3", () => {
        expect(inst.cause?.name).toStrictEqual("dummy_name/");
    })

    test("4", () => {
        expect(inst.cause?.message).toStrictEqual("Invalid Invitation Token.");
    })

    test("5", () => {
        expect(inst.cause?.stack).toStrictEqual("Message originator is not the grader, or the person being graded");
    })
})

describe("InvalidRequestError", () => {
    let inst: InvalidRequestError.InvalidRequestError;

    beforeEach(() => {
        inst = new InvalidRequestError.InvalidRequestError("Uploaded file was not added to the resource. ",
            { name: "dummyname", message: "Wait time out reached, while waiting for results", stack: "There is a mismatch" })
    })

    test("0", () => {
        expect(inst.name).toStrictEqual("InvalidRequestError");
    })

    test("1", () => {
        expect(inst.message).toStrictEqual("Uploaded file was not added to the resource. ");
    })

    test("2", () => {
        expect(inst.stack).toContain("InvalidRequestError: Uploaded file was not added to the resource. ");
    })

    test("3", () => {
        expect(inst.cause?.name).toStrictEqual("dummyname");
    })

    test("4", () => {
        expect(inst.cause?.message).toStrictEqual("Wait time out reached, while waiting for results");
    })

    test("5", () => {
        expect(inst.cause?.stack).toStrictEqual("There is a mismatch");
    })
})

describe("InvalidResponseError", () => {
    let inst: InvalidResponseError.InvalidResponseError;

    beforeEach(() => {
        inst = new InvalidResponseError.InvalidResponseError("Invalid response received. ",
            { name: "/invalidresponse", message: "cannot parse the response.", stack: "There is a mismatch in response format" })
    })

    test("0", () => {
        expect(inst.name).toStrictEqual("InvalidResponseError");
    })

    test("1", () => {
        expect(inst.message).toStrictEqual("Invalid response received. ");
    })

    test("2", () => {
        expect(inst.stack).toContain("InvalidResponseError: Invalid response received. ");
    })

    test("3", () => {
        expect(inst.cause?.name).toStrictEqual("/invalidresponse");
    })

    test("4", () => {
        expect(inst.cause?.message).toStrictEqual("cannot parse the response.");
    })

    test("5", () => {
        expect(inst.cause?.stack).toStrictEqual("There is a mismatch in response format");
    })
})

describe("objectExist", () => {
    let inst: ObjectAlreadyExistError.ObjectAlreadyExistError;

    beforeEach(() => {
        inst = new ObjectAlreadyExistError.ObjectAlreadyExistError("Object you are trying to create already exits.",
            { name: "objectexists/", message: "There is already an object!", stack: "Grader object for message already in xqueue" })
    })

    test("0", () => {
        expect(inst.name).toStrictEqual("ObjectAlreadyExistError");
    })

    test("1", () => {
        expect(inst.message).toStrictEqual("Object you are trying to create already exits.");
    })

    test("2", () => {
        expect(inst.stack).toContain("ObjectAlreadyExistError: Object you are trying to create already exits.");
    })

    test("3", () => {
        expect(inst.cause?.name).toStrictEqual("objectexists/");
    })

    test("4", () => {
        expect(inst.cause?.message).toStrictEqual("There is already an object!");
    })

    test("5", () => {
        expect(inst.cause?.stack).toStrictEqual("Grader object for message already in xqueue");
    })
})


describe("ObjectNotFoundError", () => {
    let inst: ObjectNotFoundError.ObjectNotFoundError;

    beforeEach(() => {
        inst = new ObjectNotFoundError.ObjectNotFoundError("Uploaded file was not found. ", 
                            { name: "object_not_found/", message: "File not found ", stack: "does not exist" })
    })

    test("0", () => {
        expect(inst.name).toStrictEqual("ObjectNotFoundError");
    })

    test("1", () => {
        expect(inst.message).toStrictEqual("Uploaded file was not found. ");
    })

    test("2", () => {
        expect(inst.stack).toContain("ObjectNotFoundError: Uploaded file was not found. ");
    })

    test("3", () => {
        expect(inst.cause?.name).toStrictEqual("object_not_found/");
    })

    test("4", () => {
        expect(inst.cause?.message).toStrictEqual("File not found ");
    })

    test("5", () => {
        expect(inst.cause?.stack).toStrictEqual("does not exist");
    })
})

describe("TimeoutError", () => {
    let inst: TimeoutError.TimeoutError;

    beforeEach(() => {
        inst = new TimeoutError.TimeoutError("Operation time out.", 
                { name: "timeout/", message: "Timeout in stream read", stack: "Sorry, This video cannot be accessed via this website" })
    })

    test("0", () => {
        expect(inst.name).toStrictEqual("TimeoutError");
    })

    test("1", () => {
        expect(inst.message).toStrictEqual("Operation time out.");
    })

    test("2", () => {
        expect(inst.stack).toContain("TimeoutError: Operation time out.");
    })

    test("3", () => {
        expect(inst.cause?.name).toStrictEqual("timeout/");
    })

    test("4", () => {
        expect(inst.cause?.message).toStrictEqual("Timeout in stream read");
    })

    test("5", () => {
        expect(inst.cause?.stack).toStrictEqual("Sorry, This video cannot be accessed via this website");
    })
})
