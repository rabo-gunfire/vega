/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import {
    Context,
    readConfig,
    Response,
    StdAccountCreateHandler,
    StdAccountCreateInput,
    StdAccountCreateOutput,
    StdAccountDeleteHandler,
    StdAccountDeleteInput,
    StdAccountDeleteOutput,
    StdAccountListHandler,
    StdAccountListOutput,
    StdAccountReadHandler,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdAccountUpdateHandler,
    StdAccountUpdateInput,
    StdAccountUpdateOutput,
    StdEntitlementListHandler,
    StdEntitlementListOutput,
    StdEntitlementReadHandler,
    StdEntitlementReadInput,
    StdEntitlementReadOutput,
    StdTestConnectionHandler,
    StdTestConnectionOutput
} from '@sailpoint/connector-sdk';

import { ConnectorError } from './connector-error';
import { DseConnector } from './dse-connector';
import { logger } from '../tools/logger';
import { InvalidConfigurationError } from './invalid-configuration-error';
import { DseConfig } from './dse-config';

/**
 * Validate source configurations.
 *
 * @param {DseConfig} config - Source configuration to validate
 */
export const validateConfig = (config: DseConfig): DseConfig => {
    if (!config.apiUrl) {
        throw new InvalidConfigurationError(`'apiUrl' is required`);
    } else if (!config.accountId) {
        throw new InvalidConfigurationError(`'accountId' is required`);
    } else if (!config.clientId) {
        throw new InvalidConfigurationError(`'clientId' is required`);
    } else if (!config.userId) {
        throw new InvalidConfigurationError(`'userId' is required`);
    } else if (!config.privateKey) {
        throw new InvalidConfigurationError(`'privateKey' is required`);
    }

    return config;
};

// Create reusable connector object
const config = validateConfig(readConfig() as DseConfig);
const dseConnector = new DseConnector(config);

/**
 * Connection check handler.
 *
 * @param {Context} context - Source configuration.
 * @param {undefined} input - Test connection input parameters.
 * @param {Response<StdTestConnectionOutput>} res - stream to write operation response.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdTestConnectionHandler: StdTestConnectionHandler = async (
    context: Context,
    input: undefined,
    res: Response<StdTestConnectionOutput>
): Promise<void> => {
    try {
        await dseConnector.testConnection(res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error(error, 'Test connection failed.');

            throw error;
        } else {
            const err = error as Error;
            const ce = new ConnectorError(`Test connection failed. ${err.message}`, err);
            logger.error(ce);

            throw ce;
        }
    }
};

/**
 * User account read handler.
 *
 * @param {Context} context - Source configuration.
 * @param {StdAccountReadInput} input - User account read input parameters.
 * @param {Response<StdAccountReadOutput>} res - stream to write operation response.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdAccountReadHandler: StdAccountReadHandler = async (
    context: Context,
    input: StdAccountReadInput,
    res: Response<StdAccountReadOutput>
): Promise<void> => {
    try {
        await dseConnector.readAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error(error, 'Read account failed.');

            throw error;
        } else {
            const err = error as Error;
            const ce = new ConnectorError(`Read account failed. ${err.message}`, err);
            logger.error(ce);

            throw ce;
        }
    }
};

/**
 * User account aggregation handler.
 *
 * @param {Context} context - Source configuration.
 * @param {undefined} input - none.
 * @param {Response<StdAccountListOutput>} res - stream to write operation responses.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdAccountListHandler: StdAccountListHandler = async (
    context: Context,
    input: undefined,
    res: Response<StdAccountListOutput>
): Promise<void> => {
    try {
        await dseConnector.listAccounts(res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error(error, 'Account aggregation failed.');

            throw error;
        } else {
            const err = error as Error;
            const ce = new ConnectorError(`Account aggregation failed. ${err.message}`, err);
            logger.error(ce);

            throw ce;
        }
    }
};

/**
 * Entitlement read handler.
 *
 * @param {Context} context - Source configuration.
 * @param {StdEntitlementReadInput} input - User account read input parameters.
 * @param {Response<StdEntitlementReadOutput>} res - stream to write operation response.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdEntitlementReadHandler: StdEntitlementReadHandler = async (
    context: Context,
    input: StdEntitlementReadInput,
    res: Response<StdEntitlementReadOutput>
): Promise<void> => {
    const error = new ConnectorError('Operation not supported.');
    logger.error(error);
    throw error;
};

/**
 * Entitlement aggregation handler.
 *
 * @param {Context} context - Source configuration.
 * @param {undefined} input - none.
 * @param {Response<StdEntitlementListOutput>} res - stream to write operation responses.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdEntitlementListHandler: StdEntitlementListHandler = async (
    context: Context,
    input: undefined,
    res: Response<StdEntitlementListOutput>
): Promise<void> => {
    try {
        await dseConnector.listEntitlements(res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error(error, 'Group aggregation failed.');

            throw error;
        } else {
            const err = error as Error;
            const ce = new ConnectorError(`Group aggregation failed. ${err.message}`, err);
            logger.error(ce);

            throw ce;
        }
    }
};

/**
 * User account creation handler.
 *
 * @param {Context} context - Source configuration.
 * @param {StdAccountCreateInput} input - User account creation attribute add plan.
 * @param {Response<StdAccountCreateOutput>} res - stream to write operation response.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdAccountCreateHandler: StdAccountCreateHandler = async (
    context: Context,
    input: StdAccountCreateInput,
    res: Response<StdAccountCreateOutput>
): Promise<void> => {
    logger.info(input, 'Account creation plan.');

    try {
        await dseConnector.createAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error(error, 'Account creation failed.');

            throw error;
        } else {
            const err = error as Error;
            const ce = new ConnectorError(`Account creation failed. ${err.message}`, err);
            logger.error(ce);

            throw ce;
        }
    }
};

/**
 * User account updating handler.
 *
 * @param {Context} context - Source configuration.
 * @param {StdAccountCreateInput} input - User account update attribute change plan.
 * @param {Response<StdAccountCreateOutput>} res - stream to write operation response.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdAccountUpdateHandler: StdAccountUpdateHandler = async (
    context: Context,
    input: StdAccountUpdateInput,
    res: Response<StdAccountUpdateOutput>
): Promise<void> => {
    logger.info(input, 'Account update plan.');

    try {
        await dseConnector.updateAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error(error, 'Account updates failed.');

            throw error;
        } else {
            const err = error as Error;
            const ce = new ConnectorError(`Account updates failed. ${err.message}`, err);
            logger.error(ce);

            throw ce;
        }
    }
};

/**
 * User account deletion handler.
 *
 * @param {Context} context - Source configuration.
 * @param {StdAccountCreateInput} input - User account deletion input parameters.
 * @param {Response<StdAccountCreateOutput>} res - stream to write operation response.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdAccountDeleteHandler: StdAccountDeleteHandler = async (
    context: Context,
    input: StdAccountDeleteInput,
    res: Response<StdAccountDeleteOutput>
): Promise<void> => {
    logger.info(input, 'Account delete plan.');

    try {
        await dseConnector.deleteAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error(error, 'Account delete failed.');

            throw error;
        } else {
            const err = error as Error;
            const ce = new ConnectorError(`Account delete failed. ${err.message}`, err);
            logger.error(ce);

            throw ce;
        }
    }
};
