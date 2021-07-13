/* Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved. */

import { Connector, createConnector } from '@sailpoint/connector-sdk'
import {
   stdAccountCreateHandler,
   stdAccountDeleteHandler,
   stdAccountListHandler,
   stdAccountReadHandler,
   stdAccountUpdateHandler,
   stdEntitlementListHandler,
   stdEntitlementReadHandler,
   stdTestConnectionHandler,
} from './connectors/dse-handlers'

export const connector: Connector = createConnector()
   .stdTestConnection(stdTestConnectionHandler)
   .stdAccountRead(stdAccountReadHandler)
   .stdAccountList(stdAccountListHandler)
   .stdEntitlementRead(stdEntitlementReadHandler)
   .stdEntitlementList(stdEntitlementListHandler)
   .stdAccountCreate(stdAccountCreateHandler)
   .stdAccountUpdate(stdAccountUpdateHandler)
   .stdAccountDelete(stdAccountDeleteHandler);
