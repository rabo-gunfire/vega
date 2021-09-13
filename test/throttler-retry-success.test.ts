/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import {
    ApiClient,
    UserInformationList,
    UsersApi
} from "docusign-esign";
import { executeRequestThrottleOn } from "../src/docusign/request-throttler";

//////////////////////////////////////////////////////////////////////
//
// COMMON CONSTANTS
//
//////////////////////////////////////////////////////////////////////
const mockListUsers = {
    users: [{
        userId: "34bade63-d863-4d12-a40d-5acd5a11fed0",
        userName: "fake-1.user",
        email: "fake-1.user@fakemail.com"
    },
    {
        userId: "45bade63-d863-4d12-a40d-5acd5a11fet7",
        userName: "fake-2.user",
        email: "fake-2.user@fakemail.com"
    }],
    endPosition: "1",
    resultSetSize: "2",
    startPosition: "0",
    totalSetSize: "2",
} as UserInformationList;

const mockRateLimitExhaust = {
    status: 400,
    message: "Bad Request",
    stack: "Error: Bad Request\n    at Request.Object.<anonymous>.Request.callback (/Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/index.js:696:15)\n    at /Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/index.js:906:18\n    at IncomingMessage.<anonymous> (/Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/parsers/json.js:19:7)\n    at IncomingMessage.emit (node:events:377:35)\n    at IncomingMessage.emit (node:domain:470:12)\n    at endReadableNT (node:internal/streams/readable:1312:12)\n    at processTicksAndRejections (node:internal/process/task_queues:83:21)",
    response: {
        text: "{\"errorCode\":\"HOURLY_APIINVOCATION_LIMIT_EXCEEDED\",\"message\":\"The maximum number of hourly API invocations has been exceeded. The hourly limit is 1000.\"}",
        body: {
            errorCode: "HOURLY_APIINVOCATION_LIMIT_EXCEEDED",
            message: "The maximum number of hourly API invocations has been exceeded. The hourly limit is 1000.",
        },
        headers: {
            "cache-control": "no-cache",
            "content-length": "153",
            "content-type": "application/json; charset=utf-8",
            "x-ratelimit-reset": "1631174400",
            "x-ratelimit-remaining": "0",
            "x-ratelimit-limit": "1000",
            "x-burstlimit-remaining": "499",
            "x-burstlimit-limit": "500",
            "x-docusign-tracetoken": "37c068f5-3768-4760-8284-df4611185918",
            "x-docusign-node": "DA2DFE188",
            date: "Thu, 09 Sep 2021 07:30:49 GMT",
            vary: "Accept-Encoding",
            connection: "close",
        },
        statusCode: 400,
        status: 400,
        statusType: 4,
        info: false,
        ok: false,
        redirect: false,
        clientError: true,
        serverError: false,
        error: {
            status: 400,
            text: "{\"errorCode\":\"HOURLY_APIINVOCATION_LIMIT_EXCEEDED\",\"message\":\"The maximum number of hourly API invocations has been exceeded. The hourly limit is 1000.\"}",
            method: "GET",
            path: "/restapi/v2.1/accounts/14072015/users/f73490fc-1a6e-42aa-a0a8-91bd09a68403",
        },
        accepted: false,
        noContent: false,
        badRequest: true,
        unauthorized: false,
        notAcceptable: false,
        forbidden: false,
        notFound: false,
        type: "application/json",
        charset: "utf-8",
    }
};

const mockRateLimitBurst = {
    status: 400,
    message: "Bad Request",
    stack: "Error: Bad Request\n    at Request.Object.<anonymous>.Request.callback (/Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/index.js:696:15)\n    at /Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/index.js:906:18\n    at IncomingMessage.<anonymous> (/Users/rahul.borate/work/saas-conn/saas-conn-docusign/node_modules/superagent/lib/node/parsers/json.js:19:7)\n    at IncomingMessage.emit (node:events:377:35)\n    at IncomingMessage.emit (node:domain:470:12)\n    at endReadableNT (node:internal/streams/readable:1312:12)\n    at processTicksAndRejections (node:internal/process/task_queues:83:21)",
    response: {
        text: "{\"errorCode\":\"BURST_APIINVOCATION_LIMIT_EXCEEDED\",\"message\":\"The maximum number of burst API invocations has been exceeded. The burst limit is 500.\"}",
        body: {
            "errorCode": "BURST_APIINVOCATION_LIMIT_EXCEEDED",
            "message": "The maximum number of burst API invocations has been exceeded. The burst limit is 500."
        },
        headers: {
            "cache-control": "no-cache",
            "content-length": "153",
            "content-type": "application/json; charset=utf-8",
            "x-ratelimit-reset": "1631174400",
            "x-ratelimit-remaining": "0",
            "x-ratelimit-limit": "1000",
            "x-burstlimit-remaining": "499",
            "x-burstlimit-limit": "500",
            "x-docusign-tracetoken": "37c068f5-3768-4760-8284-df4611185918",
            "x-docusign-node": "DA2DFE188",
            date: "Thu, 09 Sep 2021 07:30:49 GMT",
            vary: "Accept-Encoding",
            connection: "close",
        },
        statusCode: 400,
        status: 400,
        statusType: 4,
        info: false,
        ok: false,
        redirect: false,
        clientError: true,
        serverError: false,
        error: {
            status: 400,
            text: "{\"errorCode\":\"BURST_APIINVOCATION_LIMIT_EXCEEDED\",\"message\":\"The maximum number of burst API invocations has been exceeded. The burst limit is 500.\"}",
            method: "GET",
            path: "/restapi/v2.1/accounts/14072015/users/f73490fc-1a6e-42aa-a0a8-91bd09a68403",
        },
        accepted: false,
        noContent: false,
        badRequest: true,
        unauthorized: false,
        notAcceptable: false,
        forbidden: false,
        notFound: false,
        type: "application/json",
        charset: "utf-8",
    }
};

//////////////////////////////////////////////////////////////////////
//
// USERSAPI MOCKS
//
//////////////////////////////////////////////////////////////////////
let apiResponse = Promise.resolve(mockListUsers);

const __setMockResponseForFirstApiCall: any = (mockRes: Promise<any>) => {
    apiResponse = mockRes;
};

/* Mock docusign-esign UsersApi */
jest.mock("docusign-esign/src/api/UsersApi", () => {
    return jest.fn().mockImplementation(() => {
        return {
            list: jest.fn().mockImplementationOnce((userApi, args) => {
                return apiResponse;
            }).mockImplementationOnce((userApi, args) => {
                return Promise.resolve(mockListUsers);;
            })
        }
    });
});

//////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////

describe("executeRequestThrottleOn", () => {
    const accountId = '56321001';

    test("[0] rate limit exhausted and then retried to succeed", async () => {
        __setMockResponseForFirstApiCall(Promise.reject(mockRateLimitExhaust));

        const usersApi = new UsersApi(new ApiClient({ basePath: 'https://fakeapi.acme.org/restapi', oAuthBasePath: '' }));
        let result = await executeRequestThrottleOn(usersApi.list, usersApi, [accountId, {}]);

        expect(usersApi.list).toBeCalled();
        expect(usersApi.list).toBeCalledTimes(2);
        expect(usersApi.list).toHaveBeenCalledWith(accountId, {});
        expect(result.totalSetSize).toStrictEqual("2");
    });

    test("[1] rate limit bursted and then retried to succeed", async () => {
        __setMockResponseForFirstApiCall(Promise.reject(mockRateLimitBurst));

        const usersApi = new UsersApi(new ApiClient({ basePath: 'https://fakeapi.acme.org/restapi', oAuthBasePath: '' }));
        let result = await executeRequestThrottleOn(usersApi.list, usersApi, [accountId, {}]);

        expect(usersApi.list).toBeCalled();
        expect(usersApi.list).toBeCalledTimes(2);
        expect(usersApi.list).toHaveBeenCalledWith(accountId, {});
        expect(result.totalSetSize).toStrictEqual("2");
    });
});
