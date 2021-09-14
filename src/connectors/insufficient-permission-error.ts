/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ConnectorError } from './connector-error';

/**
 * Thrown when an user/token has insufficient permissions to perform this operation. This includes
 *
 * 1. During any operation if connector gets a known error indicating
 * lack of permission, then use this error to be thrown to the layer above.
 */
export class InsufficientPermissionError extends ConnectorError {
    /**
     * Constructor
     * @param message
     * @param cause
     */
    constructor(message: string, cause?: Error | undefined) {
        super(message, cause);
        this.name = 'InsufficientPermissionError';
    }
}
