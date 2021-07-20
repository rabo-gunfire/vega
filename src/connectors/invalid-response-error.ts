/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ConnectorError } from "./connector-error";

/**
 * Thrown when an invalid response is detected. This includes
 *
 * 1. During aggregation or in the getObject when the connector is unable to parse a data received
 * from Managed System. If something fails, when converting managed system response to ResourceObject.
 * For e.g. Connector receives a malformed response from the managed system which is not understood
 * by the connector.
 *
 * 2. When aggregating records from managed system if connectors receives only some part of the
 * record which is unacceptable, then we can have this error telling record containing partial
 * information.
 */
export class InvalidResponseError extends ConnectorError {
    /**
     * Constructor
     * @param message 
     * @param cause 
     */
    constructor(message: string, cause?: Error | undefined) {
        super(message, cause);
        this.name = 'InvalidResponseError';
    }
}
