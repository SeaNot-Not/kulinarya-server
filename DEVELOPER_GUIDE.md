# Developer guide

Documentation review date: 2026-11-09.

Use [Deployment](DEPLOYMENT.md) to configure the environment and start the server.
Use the [API reference](API_DOCUMENTATION.md) for request contracts.

## Source responsibilities

| Location | Responsibility |
| --- | --- |
| [server.js](server.js) | Connect to MongoDB, then start the HTTP listener. |
| [src/app.js](src/app.js) | Install middleware, mount routers, and handle unknown routes. |
| [src/routes](src/routes) | Define HTTP methods, paths, and route access checks. |
| [src/controllers](src/controllers) | Call models and form HTTP responses. |
| [src/models](src/models) | Define database fields and application rules. |
| [src/validations](src/validations) | Define Zod schemas. |
| [src/middleware](src/middleware) | Handle authentication, roles, uploads, and errors. |
| [src/utils](src/utils) | Support queries, storage, token checks, and notifications. |
| [src/mail](src/mail) | Form verification and password reset emails. |

The source uses ES modules. Use `import` and `export` in application files.
Most application rules are Mongoose static methods. There is no separate service layer.

## Trace an endpoint

1. Find the router mount in `src/app.js`.
2. Find the method and relative path in the router.
3. Read all middleware installed on that route.
4. Read the controller and its response fields.
5. Read the called model method and its validation schema.
6. Read the storage, email, or notification helpers that the method calls.
7. Compare the full path with client query or mutation hooks.

Do not infer server authorization from a client page or a route comment.
Some role checks are in routers. Some ownership checks are in models.
The HTTP `Authorization` header is allowed by CORS, but authentication reads a cookie.

## Change an endpoint

1. Define the expected request and response fields.
2. Define the permitted users and record owners.
3. Update the validation schema and model method.
4. Update the controller response.
5. Update the route and its access middleware.
6. Update client requests when the contract changes.
7. Update the API reference and related guides.
8. Do the manual checks for the changed behavior.

Use the parsed result when a Zod transformation must affect stored data.
A call to `.parse()` alone does not replace the original input.
Use `CustomError` for an expected error with a specific status code.
Review each operation before and after external service calls.
Media files and database records are not updated in one transaction.

### Existing controller pattern

This example follows the existing recipe controller. It describes current code, not a new implementation.

```js
export const postNewRecipe = expressAsyncHandler(async (req, res) => {
  const result = await Recipe.createRecipe(req);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Recipe Submitted For Moderation",
    result,
  });
});
```

Read [recipeController.js](src/controllers/recipeController.js) for imports and other handlers.
The response message is an exact source string. Do not change protocol examples during a language-only edit.

## Validation and uploads

The Zod files describe request rules. The Mongoose schemas describe stored fields.
These rules differ in some places. For example, ingredient quantities arrive as strings and are stored as numbers.

Recipe creation and update parse JSON strings from multipart text fields.
Do not send direct arrays from an old Bruno JSON example.
Profile uploads use the file field `profilePictureUrl`, not `profilePicture`.
Recipe uploads use `mainPicture`, `additionalPictures`, and `video`.

Use the [media upload table](API_DOCUMENTATION.md#media-uploads) for types and limits.
The Multer filter rejects MOV files before the model helper runs.
The helper's oversized-file error contains an undefined variable.

Recipe update tests must supply retained picture URLs and complete array fields.
The model converts omitted array fields to empty arrays and can remove existing media.
Use test media for update and deletion checks.

## Error handling

Most asynchronous controllers use `express-async-handler`.
The global middleware handles Zod, JWT, Multer, Mongoose, duplicate-key, and custom errors.
Read [errorHandler.js](src/middleware/errorHandler.js) for the response structure.

Error formats are not identical across all endpoints.
The fallback 404 and reset-token verification responses bypass parts of the common format.
The comment deletion controller does not use the asynchronous wrapper used by most other controllers.
Review error propagation when you change that path.

## Manual API checks

The repository does not have an automated test suite.
`npm test` prints `Error: no test specified` and exits with status 1.
No lint or documentation-generation script is defined.

1. Start the API against a disposable database.
2. Open the Bruno collection in `kulinarya-api`.
3. Replace saved credentials, tokens, and IDs with test values.
4. Do a check of each method, path, and body against the route source.
5. Log in and retain the authentication cookie.
6. Send the request with a valid body.
7. Compare the HTTP status and response fields with the controller.
8. Send invalid input and confirm the error response.
9. Repeat protected requests without a cookie and with an unauthorized test account.
10. Confirm database changes and external files when the operation changes data.

The collection is a set of saved requests. It has duplicate authentication folders and stale examples.
See the [collection differences](API_DOCUMENTATION.md#bruno-collection) before use.
A successful HTTP response alone does not verify database or storage cleanup.

### Useful scenarios

| Change area | Scenarios |
| --- | --- |
| Authentication | Valid login, wrong password, missing cookie, expired token, logout. |
| Role checks | `user`, `admin`, and `creator` accounts; rejected self-moderation. |
| Recipes | Creation, approved list, pending list, update, feature toggle, owner deletion. |
| Uploads | Small valid picture, invalid MIME type, large picture, MP4, rejected MOV. |
| Comments | Creation, owner update, rejected foreign update, deletion, cursor pagination. |
| Reactions | New value, same value, changed value, restored soft-deleted reaction. |
| Notifications | Retrieval, unread count, recipient checks, read changes, deletion. |
| Email | Verification link, resend interval, password reset link, used token. |
| Analytics | First visit or view, repeated request within the counting interval. |

## Debugging

Use the Node.js inspector when source-level debugging is necessary:

```sh
node --inspect server.js
```

Read the process output for database, route, storage, and SMTP errors.
Do not share unredacted logs. Current log statements can include database credentials and registration passwords.

| Problem | Source to inspect |
| --- | --- |
| Wrong environment selected | `src/utils/environmentConditions.js` and exact `NODE_ENV=prod` comparison. |
| Authentication fails | `authenticateUser.js`, `tokenUtils.js`, and `User.generateAuthToken()`. |
| Upload fails | Multer filter, model helper options, and `handleSupabaseUpload.js`. |
| Email fails | `emailTransporter.js` and the relevant mail function. |
| Recipe counts differ | Aggregation stages and related moderation records. |
| Pagination misses items | Cursor timestamp filter and equal timestamps. |

## Database and query changes

Recipe aggregations combine multiple collections. Read the full pipeline before you change a field or reference.
The approval filter uses moderation records rather than the recipe `status` field.
Soft deletion uses `deletedAt`. Each query controls whether deleted records are excluded.
For example, the announcement management list includes deleted records.

The user email field declares a unique index.
The platform visit model defines compound indexes for visitor type, user, and guest with creation time.
Do not assume that recipe, moderation, or notification indexes exist because an old guide listed them.

The repository has no migration runner. For a data change:

1. Define the old and new field rules.
2. Prepare the migration and rollback procedures.
3. Make a database backup through the database provider.
4. Run the migration on a database copy.
5. Verify references, counts, and changed queries.
6. Arrange the production change through the project release process.

The source has no Redis cache, API response cache, image compression, or chunked upload system.
Treat such changes as new work with separate design and verification.

## Documentation changes

Use ASD-STE100 Simplified Technical English principles for prose.
Use short sentences, active verbs, and consistent software technical names.
Keep each procedure step focused on one action.
Keep paths, field names, code examples, and response strings exact.

Use at most 20 words for a procedural sentence and 25 words for a descriptive sentence where practical.
Use complete sentences. Do not remove articles or use contractions to shorten text.
Use a noun such as “authentication cookie” consistently for the same item.
Use “Do a check of” when an instruction requires a check.

The source of the writing rules is [ASD-STE100](https://www.asd-ste100.org/).
This documentation review is not an independent certification of full dictionary compliance.

Update these files when their subjects change:

| Subject | Documentation |
| --- | --- |
| Setup or commands | `README.md` and `DEPLOYMENT.md`. |
| Method, path, fields, or access | `API_DOCUMENTATION.md`. |
| Model or request flow | `ARCHITECTURE.md`. |
| Development procedure | `DEVELOPER_GUIDE.md`. |
| Guide contents or known limits | `DOCS_TABLE_OF_CONTENTS.md` and `DOCUMENTATION_SUMMARY.md`. |

## Release checks

1. Review the diff for code, contract, and documentation changes.
2. Do the manual checks for the changed functions.
3. Record any tests that could not run and the reason.
4. Read the [deployment procedure](DEPLOYMENT.md#production-process).
5. Confirm the selected environment, HTTPS access, and credentialed requests on the target host.

The repository has no enforced branch strategy, staging pipeline, or automated release workflow.
Do not infer one from example names in older guides.
