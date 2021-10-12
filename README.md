# Vega
[![build and test status](https://github.com/rahul-borate/saas-conn-docusign/actions/workflows/build-test-cron.yml/badge.svg)](https://github.com/rahul-borate/saas-conn-docusign/actions/workflows/build-test-cron.yml)
![coverage](https://img.shields.io/static/v1?label=coverage&message=99%&color=brightgreen)
[![JavaScript style guide: ESLint](https://img.shields.io/static/v1?label=code%20style&message=eslint&color=blue)](https://github.com/eslint/eslint)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)


## Getting Started/

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
