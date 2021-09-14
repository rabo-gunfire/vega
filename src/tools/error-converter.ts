/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ResponseError } from 'superagent';
import { ConnectorError } from '../connectors/connector-error';
import { InsufficientPermissionError } from '../connectors/insufficient-permission-error';
import { InvalidConfigurationError } from '../connectors/invalid-configuration-error';
import { InvalidRequestError } from '../connectors/invalid-request-error';

/**
 * Convert error to an appropriate ConnectorError.
 *
 * @param {Error | any} err - An error object.
 */
export const convertToConnectorError = (err: Error | any): void => {
    if (err instanceof Error) {
        // http errors
        const e = err as ResponseError;
        if (e.status) {
            if (e.status == 400) {
                throw new InvalidRequestError(`${e.status} ${e.message}`, e);
            } else if (e.status == 401) {
                throw new InvalidConfigurationError(`${e.status} ${e.message}`, e);
            } else if (e.status == 403) {
                throw new InsufficientPermissionError(`${e.status} ${e.message}`, e);
            } else if (e.status == 404) {
                throw new InvalidRequestError(`${e.status} ${e.message}`, e);
            } else {
                throw new ConnectorError(`${e.status} ${e.message}`, e);
            }
        } else {
            throw new ConnectorError(`${e.message}`, e);
        }
    } else if (err.code) {
        // wire errors
        if (err.code == 'ENOTFOUND') {
            throw new InvalidConfigurationError(
                `Unknown host. message: ${err.message} , errno: ${err.errno} , code: ${err.code}`,
                err
            );
        }

        // RSA key errors
        if (err.code == 'ERR_OSSL_PEM_BAD_END_LINE' || err.code == 'ERR_OSSL_PEM_NO_START_LINE') {
            throw new InvalidConfigurationError(`Invalid RSA private key. ${err.message}`, err);
        }
    } else {
        throw new ConnectorError(err);
    }
};
