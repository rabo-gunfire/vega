/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import pino from 'pino';

export const logger = pino ({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    timestamp: () => `,"@timestamp":"${new Date(Date.now()).toISOString()}"`,
    messageKey: 'message',
    base: {
        pid: process.pid
    },
    formatters: {
        level: (label: string) => {
            return { level: label.toUpperCase() };
        }
    },
    mixin() {
        return { AppType: 'DocuSign eSignature' };
    },
    redact: {
        paths: [
            'cause.response.request._header.authorization',
            'response.request._header.authorization',
            'cause.response.request._data.refresh_token',
            'response.request._data.refresh_token',
            'cause.response.request._data.assertion'
        ],
        censor: '****'
    }
});
