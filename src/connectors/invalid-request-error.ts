/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ConnectorError } from "./connector-error";

/**
 * Thrown when an invalid request is detected. This includes
 * 
 * 1. During any operation when the connector is creating messages to be sent to the managed system, 
 * but it fails to create a message. This could happen before sending a request to the managed system.
 * for e.g. Due to malformed provisioning policy the connector fails to create a message to be broadcast
 * to the managed system.
 *
 * 2. This is intended for cases in which the client (to the managed system) seems to have erred. The request
 * could not be understood by the managed system due to malformed syntax of the request message. This could
 * take place while executing a request along the target managed system. For e.g. During any operation
 * when the connector receives known exception/error 'Bad Request' from the managed system.
 */
export class InvalidRequestError extends ConnectorError {
    /**
     * Constructor
     * @param message 
     * @param cause 
     */
    constructor(message: string, cause?: Error | undefined) {
        super(message, cause);
        this.name = 'InvalidRequestError';
    }
}
