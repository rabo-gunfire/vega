/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ConnectionFailedError } from './connection-failed-error';

/**
 * Thrown when a connector interaction with a target system timeouts. This includes
 *
 * This is intended for cases in which the connector receives timeout related error/exception
 * from a managed system.For e.g. During any operation if a connector receives known
 * exception/error "Operation timed out" from the managed system.
 */
export class TimeoutError extends ConnectionFailedError {
    /**
     * Constructor
     * @param message
     * @param cause
     */
    constructor(message: string, cause?: Error | undefined) {
        super(message, cause);
        this.name = 'TimeoutError';
    }
}
