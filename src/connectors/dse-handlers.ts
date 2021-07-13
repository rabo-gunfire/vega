/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import {
    Context,
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

import { ConnectorError } from './ConnectorError';
import { DseConnector } from './dse-connector';

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
        let dseConnector = new DseConnector(context);
        await dseConnector.testConnection(res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            console.error('Test connection failed.');
            console.error(error);

            throw error;
        } else {
            let err = new ConnectorError(`Test connection failed. ${error.message}`, error)
            console.error(err);

            throw err;
        }
    }
}

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
        let dseConnector = new DseConnector(context);
        await dseConnector.readAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            console.error('Read account failed.');
            console.error(error);

            throw error;
        } else {
            let err = new ConnectorError(`Read account failed. ${error.message}`, error)
            console.error(err);

            throw err;
        }
    }
}

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
        let dseConnector = new DseConnector(context);
        await dseConnector.listAccounts(res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            console.error('Account aggrgation failed.');
            console.error(error);

            throw error;
        } else {
            let err = new ConnectorError(`Account aggrgation failed. ${error.message}`, error)
            console.error(err);

            throw err;
        }
    }
}

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

    let error = new ConnectorError('Operation not supported.')
    console.error(error);
    throw error;
}

/**
 * Entitlement aggrgation handler.
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
        let dseConnector = new DseConnector(context);
        await dseConnector.listEntitlements(res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            console.error('Group aggrgation failed.');
            console.error(error);

            throw error;
        } else {
            let err = new ConnectorError(`Group aggrgation failed. ${error.message}`, error)
            console.error(err);

            throw err;
        }
    }
}

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
        let dseConnector = new DseConnector(context);
        await dseConnector.crateAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            console.error('Account creation failed.');
            console.error(error);

            throw error;
        } else {
            let err = new ConnectorError(`Account creation failed. ${error.message}`, error)
            console.error(err);

            throw err;
        }
    }
}

/**
 * User account updation handler.
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
        let dseConnector = new DseConnector(context);
        await dseConnector.updateAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            console.error('Account updates failed.');
            console.error(error);

            throw error;
        } else {
            let err = new ConnectorError(`Account updates failed.. ${error.message}`, error)
            console.error(err);

            throw err;
        }
    }
}

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
        let dseConnector = new DseConnector(context);
        await dseConnector.deleteAccount(input, res);
    } catch (error) {
        if (error instanceof ConnectorError) {
            console.error('Account delete failed.');
            console.error(error);

            throw error;
        } else {
            let err = new ConnectorError(`Account delete failed. ${error.message}`, error)
            console.error(err);

            throw err;
        }
    }
}
