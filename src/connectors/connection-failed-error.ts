/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ConnectorError } from './connector-error';

/**
 * Thrown when a connector interaction with a target system fails. This includes
 *
 * 1. The application configuration is correct, but when making a connection to managed
 * system the connector receives an error 'Host not reachable/firewall issue'.
 *
 * 2. All wire exceptions or errors can be categorized into this error bucket
 */
export class ConnectionFailedError extends ConnectorError {
    /**
     * Constructor
     * @param message
     * @param cause
     */
    constructor(message: string, cause?: Error | undefined) {
        super(message, cause);
        this.name = 'ConnectionFailedError';
    }
}
