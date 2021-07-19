/* Copyright (c) 2021. SailPoint Technologies, Inc. All rights reserved. */

/**
 * Docusign eSignature app connectivity configuration definition
 */
export interface DseConfig {
    apiUrl: string
    oauthServerUrl: string
    accountId: string
    clientId: string
    clientSecret: string
    refreshToken: string
}
