# DocuSign eSignature Connector
This project is a DocuSign eSignature connector used by the SailPoints identity and access governance platforms to manage identity and access
in DocuSign eSignature application. The connector connects the SailPoint identity platform to DocuSign eSignature application securely to load
data from and provisioning changes to DocuSign eSignature.

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
