/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ConnectorError } from "./ConnectorError";

/**
 * Thrown when an application lacking some configuration. This includes
 *
 * 1. During any operation if connector requires certain configuration to connect to the managed-system
 * which is not provided or is faulty. This could happen before sending a request to the managed system.
 *
 * 2. When a connector receives any error/exception of the managed system, and to fix such error if
 * there is a need to correct the application configuration. This could take place when the managed
 * system provides a response to a request.
 */
export class InvalidConfigurationError extends ConnectorError {
    /**
     * Constructor
     * @param message
     * @param cause
     */
    constructor(message: string, cause?: Error | undefined) {
        super(message, cause);
        this.name = 'InvalidConfigurationError';
    }
}
