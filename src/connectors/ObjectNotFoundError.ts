/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ConnectorError } from "./ConnectorError";

/**
 * Thrown when any particular object not found. This includes
 * 1. Specific user is not found on managed system.
 * 2. Specific entitlement is not found on manages system.
 */
export class ObjectNotFoundError extends ConnectorError {
    /**
     * Constructor
     * @param message 
     * @param cause 
     */
    constructor(message: string, cause?: Error | undefined) {
        super(message, cause);
        this.name = 'ObjectNotFoundError';
    }
}
