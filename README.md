# DocuSign eSignature Connector
[![build and test status](https://github.com/sailpoint/saas-conn-docusign/actions/workflows/build-test-cron.yml/badge.svg)](https://github.com/sailpoint/saas-conn-docusign/actions/workflows/build-test-cron.yml)
![coverage](https://img.shields.io/static/v1?label=coverage&message=99%&color=brightgreen)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)

This project is a DocuSign eSignature connector module used by the SailPoints identity and access governance platforms to manage identity and access
in DocuSign eSignature application. The connector connects the SailPoint identity platform to DocuSign eSignature application securely to load data
from and provisioning changes to DocuSign eSignature.

This is a connector that works within SaaS Connectivity 2.0 platform.

## Getting Started

#### Prerequisites
- [Node.js >= 16.2.0](https://nodejs.org/en/download/releases/)
- [TypeScript >= 4.4.2](https://www.typescriptlang.org/download)

#### Install Project Dependencies

```
npm install
```

#### Build a Project

Simply issuing the command below from the root directory will trigger the build task:

```
npm run build
```

Build generates the output in the `dist` directory.

#### Deliverable Artifact

Issue the following command to create a deliverable zip artifact.

```
npm run pack-zip
```

The command generates a zip artifact in the `dist` directory.

## Testing

#### Unit Tests
Issue the following command to execute all tests:

```
npm run test
```
Unit tests execution generates code coverage report in the `coverage` directory.

#### Integration Tests
Issue the following command to execute all tests:

```
npm run spec
```

## References

- [DocuSign eSignature REST API](https://developers.docusign.com/docs/esign-rest-api/reference)
    - [Node.js SDK](https://developers.docusign.com/docs/esign-rest-api/sdk-tools/node) - Connector uses Node.js based SDK to interact with DocuSign application.
    - [JWT Flow](https://developers.docusign.com/platform/auth/jwt) - Connector uses JSON web token flow to obtain access token.
    - [Rate Limit](https://developers.docusign.com/platform/resource-limits) - All DocuSign APIs limit each account to a certain number of requests per hour.
