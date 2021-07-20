/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { ConnectorError } from "./connector-error";

/**
 * Thrown when any particular object already exists. This includes
 * 1. Specific user is already exists on managed system.
 * 2. Specific entitlement is already exists on managed system.
 */
export class ObjectAlreadyExistError extends ConnectorError {
    /**
     * Constructor
     * @param message 
     * @param cause 
     */
    constructor(message: string, cause?: Error | undefined) {
        super(message, cause);
        this.name = 'ObjectAlreadyExistError';
    }
}
