/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

/**
 * A generic error thrown by connectors when operations fail. This usually
 * indicates some problem with the underlying resource or the data passed to
 * the resource.
 */
export class ConnectorError extends Error {
    /**
     * cause of exception
     */
    public cause: Error | undefined;

    /**
     * Constructor
     * @param message
     * @param cause
     */
    constructor(message: string, cause?: Error | undefined) {
        super(message);
        this.cause = cause;
        this.name = 'ConnectorError';
    }
}
