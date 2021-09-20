# GitHub Connector
This project is a GitHub connector module used by the SailPoints identity and access governance platforms to manage identity and access
in GitHub application. The connector connects the SailPoint identity platform to GitHub application securely to load data from and
provisioning changes to GitHub.

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

## Dev Aid

#### Unit Tests
Issue the following command to execute all tests:

```
npm run test
```
#### Integration Tests
Issue the following command to execute all tests:

```
npm run spec
```

## References

- [DocuSign eSignature REST API](https://developers.docusign.com/docs/esign-rest-api/reference)
    - [Node.js SDK](https://developers.docusign.com/docs/esign-rest-api/sdk-tools/node) - Connector uses Node.js based SDK to interact with DocuSign application.
    - [JWT Flow](https://developers.docusign.com/platform/auth/jwt) - Connector uses JSON web token flow to obtain access token.
    - [Rate Limit](https://docs.github.com/en/graphql/overview/resource-limitations) - All DocuSign APIs limit each account to a certain number of requests per hour.
