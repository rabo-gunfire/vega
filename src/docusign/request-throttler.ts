/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import {
    ApiClient,
    GroupsApi,
    UsersApi
} from "docusign-esign";
import moment from "moment";
import {
    HTTPError,
    Response,
    ResponseError
} from "superagent";
import { logger } from "../tools/logger";

/**
 * Execute request and provides request throttling controller
 * to ensures the API is fast and available for connector.
 * Requests stays within published request rates defined
 * by the RateLimit header fields from the HTTP response. 
 *
 * If connector hit a rate limit, it's expected that the connector back off
 * from making requests and try again later when he is permitted to do so.
 *
 * When hitting rate limit a connector slows down automatically and is
 * allowed to retry the same request only once.
 *
 * When abusing rate limit a client is allowed to retry only once.
 *
 * @param {Function} func - docusign function to call
 * @param {UsersApi | GroupsApi} - an object on which given function to call
 * @param {Array} args - arguments to pass to function call
 * @returns promise of any
 */
export const executeRequestThrottleOn = async (
    func: Function, obj: ApiClient | UsersApi | GroupsApi, args: any[]): Promise<any> => {

    // If request quota exhausted or bursts, then
    // operation will be retried only once.
    const maxRetryAttempts = 1;

    for (let i = 0; i <= maxRetryAttempts; i++) {
        try {
            // execute API call
            return await func.apply(obj, args);
        } catch (error) {
            const res = (error as ResponseError).response as Response;
            const { rlExhausted, rlBurst } = hasRateLimit(res);

            if (rlExhausted || rlBurst) {
                const { httpMethod, httpPath } = getHttpMethodAndPath(res.error as HTTPError);
                if (rlExhausted) { logger.warn(`Request quota exhausted for request ${httpMethod} ${httpPath}`); }
                if (rlBurst) { logger.warn(`Burst detected for request ${httpMethod} ${httpPath}`); }

                if (i < maxRetryAttempts) {
                    const retryAfter = getRetryAfterDuration(res);
                    logger.info(`Retrying after ${retryAfter} seconds!`);

                    await backOff(retryAfter);
                } else {
                    logger.error(`Rate limit retry (attempt: 1) failed for request ${httpMethod} ${httpPath}`);

                    throw error;
                }
            } else {
                throw error;
            }
        }
    }
};

/**
 * Check if connector exhausted its request-quota.
 *
 * @param {Error} error - instance of an error
 * @param {Response} res - API response
 */
const hasRateLimitExhausted = (res: Response): boolean => {
    return (res && res.status === 400 && res.body?.errorCode == 'HOURLY_APIINVOCATION_LIMIT_EXCEEDED');
};

/**
 * Check if connector exhausted or bursts its request-quota.
 *
 * @param {Error} error - instance of an error
 * @param {Response} res - API response
 */
const hasRateLimitBurst = (res: Response): boolean => {
    return (res && res.status === 400 && res.body.errorCode == 'BURST_APIINVOCATION_LIMIT_EXCEEDED');
};

/**
 * Check if connector bursts its request-quota.
 *
 * @param {Response} res - API response
 */
const hasRateLimit = (res: Response): any => {
    return {
        rlExhausted: hasRateLimitExhausted(res),
        rlBurst: hasRateLimitBurst(res)
    };
};

/**
 * Back off or sleep for provided duration in seconds
 *
 * @param backOfDurationSec - back off duration in seconds
 */
const backOff = async (backOfDurationSec: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, backOfDurationSec * 1000));
};

/**
 * Calculate retry after duration in seconds
 * from 'x-ratelimit-reset' response header.
 *
 * @param {Response} res - API response
 * @returns {number} time in seconds that will be used to retry the API call
 */
const getRetryAfterDuration = (res: Response): any => {
    const now = moment(),
        resetMoment = moment.unix(Number(res.headers['x-ratelimit-reset']));

    return resetMoment.diff(now, 'seconds');
};

/**
 * Find http method and resource url form an HTTP error.
 *
 * @param {HTTPError} error - error object from API response
 * @returns http method and resource url
 */
const getHttpMethodAndPath = (error: HTTPError) => {
    return {
        httpMethod: (error && error.method) ? error.method : '',
        httpPath: (error && error.path) ? error.path : ''
    };
};
