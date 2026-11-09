# Documentation index

Documentation review date: 2026-11-09.

## Select a guide

| Task | Guide | Contents |
| --- | --- | --- |
| Start local development | [README](README.md) | Overview, commands, source map, and main functions. |
| Send API requests | [API reference](API_DOCUMENTATION.md) | All route methods, paths, fields, access checks, and pagination. |
| Understand the source | [Architecture](ARCHITECTURE.md) | Startup, models, request flow, storage, and email. |
| Configure a host | [Deployment](DEPLOYMENT.md) | Environment variables, initial administrator, services, and runtime checks. |
| Change or diagnose the API | [Developer guide](DEVELOPER_GUIDE.md) | Source responsibilities, development steps, manual checks, and error handling. |
| Review documentation changes | [Review summary](DOCUMENTATION_SUMMARY.md) | Corrected claims, verification scope, and current limits. |

## Important source files

| File or directory | Function |
| --- | --- |
| [package.json](package.json) | Dependency ranges and available npm scripts. |
| [package-lock.json](package-lock.json) | Locked dependency versions. |
| [server.js](server.js) | Database connection and listener startup. |
| [src/app.js](src/app.js) | Middleware, root route, and API mounts. |
| [environmentConditions.js](src/utils/environmentConditions.js) | Development or production variable selection. |
| [userModel.js](src/models/userModel.js) | Accounts, cookies, token operations, and initial administrator. |
| [src/routes](src/routes) | Current API methods, paths, and route access checks. |
| [src/controllers](src/controllers) | Endpoint response fields. |
| [src/models](src/models) | Database fields and application rules. |
| [src/validations](src/validations) | Input schemas. |
| [kulinarya-api](kulinarya-api) | Saved Bruno requests with known stale examples. |

There is no `.env.example`. Use the [environment variable table](DEPLOYMENT.md#environment-variables) to create the local `.env` file.
There is no generated OpenAPI reference or API documentation generator in the repository.

## Commands

Run these commands from this repository:

```sh
npm ci
npm run dev
```

Use `npm start` to start the Node.js process without Nodemon.
`npm test` is a failing placeholder. There is no lint or build script.

## Keep the guides current

1. Read the relevant route, controller, model, and configuration source.
2. Revise the guide when a command, variable, field, path, or access rule changes.
3. Preserve exact identifiers and response strings.
4. Use short sentences and consistent technical names.
5. Do a check of local links and examples.
6. Record limits that require a live service or integration test.

Use the ASD-STE100 writing principles described in the [Developer guide](DEVELOPER_GUIDE.md#documentation-changes).
The guides describe checked source. They do not prove live deployment, security effectiveness, or performance.
