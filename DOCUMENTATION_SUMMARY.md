# Documentation review summary

Review date: 2026-11-09.

## Review scope

This review covers the seven Markdown guides in this repository.
It also corrects the authentication prose in the recipe creation Bruno request.
The review compares documentation with source files and package configuration.
It does not change application code or executable Bruno request definitions.

The guides use ASD-STE100 Simplified Technical English principles.
The revision uses short sentences, direct instructions, and consistent software technical names.
Code identifiers, request fields, paths, and response strings retain their exact forms.
This review does not certify full dictionary compliance.

## Corrected information

| Subject | Current information |
| --- | --- |
| Email transport | Nodemailer uses Gmail SMTP with `GMAIL_USER` and `GMAIL_PASS`. Resend is not configured. |
| Environment selection | The literal value `prod` selects production URLs and secure cookie settings. |
| Storage access | The server uses `SUPABASE_SERVICE_ROLE_KEY` and the hardcoded bucket `kulinarya-bucket`. |
| Authentication | Protected routes read the authentication cookie, not a bearer header. |
| Initial administrator | A root `GET /` request can create the account. Startup alone does not create it. |
| Recipe routes | Public reads use `/api/recipes/approved` and `/api/recipes/approved/:recipeId`. |
| Update methods | Recipe, profile, comment, moderation, and announcement updates use their defined `PATCH` routes. |
| Roles | Both `admin` and `creator` can moderate recipes and manage announcements. |
| User management | Several user routes require authentication without an administrator role check. |
| Recipe requests | Ingredient and procedure arrays arrive as JSON strings in multipart fields. |
| Upload types | Recipe videos pass the Multer filter only as MP4. Profile pictures use JPEG or PNG. |
| Notifications | Clients retrieve stored records through HTTP. There is no live notification connection. |
| Pagination | Recipe lists use pages. Comments, reactions, and notifications use timestamp cursors. |
| Tests and scripts | `npm test` is a failing placeholder. There is no lint or build script. |
| Infrastructure | Docker, AWS, reverse proxy, CI, and health endpoint examples were not repository implementations. |
| Performance | There is no Redis cache, API response cache, image compression, or chunked upload implementation. |
| License | The package manifest declares `ISC`; there is no separate license file. |

The revised API reference covers all 54 methods in the ten route files.
The root route is documented separately because it can change account data.

## Source checks

The review used these source groups:

- `server.js`, `src/app.js`, and `package.json` for startup, mounts, scripts, and dependencies.
- `src/routes` for method, path, and route middleware checks.
- `src/controllers` for response fields and status codes.
- `src/models` and `src/validations` for data fields and application rules.
- `src/utils` and `src/mail` for environment, storage, tokens, email, and errors.
- `kulinarya-api` for saved request differences.

The review did not start the API or connect to MongoDB, Supabase, or Gmail.
No live account, email, media, deployment, performance, or security result is asserted.

## Known limits

The [API reference](API_DOCUMENTATION.md#implementation-gaps) records source defects and inconsistent checks.
These include reaction response field names, recipe edit ownership logic, media update behavior, and the upload size error.
Profile updates and account deletion have access limits that older guides did not state accurately.
Password reset requires an integration test of the token sent by email.

The Bruno collection has old IDs, tokens, credentials, methods, paths, and JSON bodies.
Its executable requests remain unchanged in this documentation review.
Use the [current reference](API_DOCUMENTATION.md#bruno-collection) before you send those requests.

The source uses Zod in multiple paths, but some methods discard parsed results.
Do not infer complete input transformation, sanitization, or XSS protection from the presence of a schema library.
Mongoose is a MongoDB library. Its use is not evidence of a separate SQL injection prevention system.

## Maintain the documentation

Update the guide that describes each source change.
Use the [index](DOCS_TABLE_OF_CONTENTS.md) to find the correct guide.
Keep unimplemented proposals separate from current behavior.
Record a test result only after the test runs against the relevant services.
