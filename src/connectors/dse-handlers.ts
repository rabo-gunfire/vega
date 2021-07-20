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
    StdTestConnectionOutput,
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
const validateConfig = (config: any): DseConfig => {
    if (!config?.apiUrl) {
        throw new InvalidConfigurationError(`'apiUrl' is required`);
    } else if (!config?.oauthServerUrl) {
        throw new InvalidConfigurationError(`'oauthServerUrl' is required`);
    } else if (!config?.accountId) {
        throw new InvalidConfigurationError(`'accountId' is required`);
    } else if (!config?.clientId) {
        throw new InvalidConfigurationError(`'clientId' is required`);
    } else if (!config?.clientSecret) {
        throw new InvalidConfigurationError(`'clientSecret' is required`);
    } else if (!config?.refreshToken) {
        throw new InvalidConfigurationError(`'refreshToken' is required`);
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
    res: Response<StdTestConnectionOutput>): Promise<void> => {
    try {
        await dseConnector.testConnection(res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error('Test connection failed.');
            logger.error(error);

            throw error;
        } else {
            const err = new ConnectorError(`Test connection failed. ${error.message}`, error);
            logger.error(err);

            throw err;
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
    res: Response<StdAccountReadOutput>): Promise<void> => {

    try {
        await dseConnector.readAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error('Read account failed.');
            logger.error(error);

            throw error;
        } else {
            const err = new ConnectorError(`Read account failed. ${error.message}`, error);
            logger.error(err);

            throw err;
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
    res: Response<StdAccountListOutput>): Promise<void> => {

    try {
        await dseConnector.listAccounts(res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error('Account aggregation failed.');
            logger.error(error);

            throw error;
        } else {
            const err = new ConnectorError(`Account aggregation failed. ${error.message}`, error);
            logger.error(err);

            throw err;
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
    res: Response<StdEntitlementReadOutput>): Promise<void> => {

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
    res: Response<StdEntitlementListOutput>): Promise<void> => {

    try {
        await dseConnector.listEntitlements(res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error('Group aggregation failed.');
            logger.error(error);

            throw error;
        } else {
            const err = new ConnectorError(`Group aggregation failed. ${error.message}`, error);
            logger.error(err);

            throw err;
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
    res: Response<StdAccountCreateOutput>): Promise<void> => {

    try {
        await dseConnector.crateAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error('Account creation failed.');
            logger.error(error);

            throw error;
        } else {
            const err = new ConnectorError(`Account creation failed. ${error.message}`, error);
            logger.error(err);

            throw err;
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
    res: Response<StdAccountUpdateOutput>): Promise<void> => {

    try {
        await dseConnector.updateAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error('Account updates failed.');
            logger.error(error);

            throw error;
        } else {
            const err = new ConnectorError(`Account updates failed.. ${error.message}`, error);
            logger.error(err);

            throw err;
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
    res: Response<StdAccountDeleteOutput>): Promise<void> => {

    try {
        await dseConnector.deleteAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            logger.error('Account delete failed.');
            logger.error(error);

            throw error;
        } else {
            const err = new ConnectorError(`Account delete failed. ${error.message}`, error);
            logger.error(err);

            throw err;
        }
    }
};
