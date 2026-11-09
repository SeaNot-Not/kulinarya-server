# Kulinarya API

Kulinarya is a platform for Filipino recipes. This repository contains the Node.js API. The React client has a separate repository.

The API stores accounts, recipes, comments, reactions, notifications, announcements, and visit records in MongoDB. It stores media in Supabase Storage.

Documentation review date: 2026-11-09. These guides describe the checked source. They do not confirm the state of a live deployment.

## Start the server

1. Open a terminal in this repository.
2. Install the locked dependencies:

   ```sh
   npm ci
   ```

3. Create a local `.env` file. Use the variable table in [Deployment](DEPLOYMENT.md#environment-variables).
4. Configure MongoDB, Supabase Storage, Gmail SMTP, and the client URL.
5. Start the development server:

   ```sh
   npm run dev
   ```

The default port is `4000`. The API prefix is `/api`.
Use `GET http://localhost:4000/api/recipes/approved` to request the public recipe list.

The root request, `GET /`, can create the initial administrator. Read the [initial account procedure](DEPLOYMENT.md#initial-administrator) before use.

## Available commands

| Command | Function |
| --- | --- |
| `npm ci` | Install the versions in `package-lock.json`. |
| `npm run dev` | Start `server.js` with Nodemon. |
| `npm start` | Start `server.js` with Node.js. |
| `npm test` | Run a placeholder that exits with an error. |

The manifest does not define build or lint commands. It does not specify a Node.js version through `engines`.

## Main parts

| Part | Implementation |
| --- | --- |
| HTTP server | Express 4 with ES modules |
| Database | MongoDB through Mongoose 8 |
| Authentication | JWT in the `kulinarya_auth_token` cookie |
| Input checks | Zod schemas and model checks |
| Media transfer | Multer memory storage and Supabase Storage |
| Email | Nodemailer with `smtp.gmail.com` |
| HTTP logs | Morgan |

Read [package.json](package.json) for dependency ranges. Read `package-lock.json` for the locked versions.

## Main functions

- Users can register, log in, verify an email address, and request a password reset.
- Users can submit recipes with pictures and an MP4 video.
- Recipe updates return the moderation record to `pending`.
- The `admin` and `creator` roles can moderate recipes and manage announcements.
- Users can add comments and reactions.
- The API stores notifications. Clients retrieve them through HTTP requests.
- The API records recipe views and platform visits.

Access checks differ between endpoints. Use the [API reference](API_DOCUMENTATION.md) for the current route checks.

## Repository map

```text
server.js           Start the database connection and HTTP server.
src/app.js          Configure middleware and mount API routes.
src/config/         Configure the database connection.
src/routes/         Define methods, paths, and route middleware.
src/controllers/    Call model methods and form responses.
src/models/         Define schemas and most application rules.
src/middleware/     Check cookies, roles, and uploads.
src/validations/    Define Zod schemas.
src/utils/          Support storage, tokens, queries, and errors.
src/mail/           Form and send email messages.
kulinarya-api/      Store the Bruno request collection.
```

## Read the guides

- [API reference](API_DOCUMENTATION.md): routes, request fields, response fields, and access checks.
- [Architecture](ARCHITECTURE.md): data models and request flow.
- [Deployment](DEPLOYMENT.md): environment variables, startup, and deployment checks.
- [Developer guide](DEVELOPER_GUIDE.md): source changes, manual checks, and fault diagnosis.
- [Documentation index](DOCS_TABLE_OF_CONTENTS.md): links to each guide.
- [Review summary](DOCUMENTATION_SUMMARY.md): corrected claims and current limits.

The Bruno collection contains old routes and request bodies. Do a check of each request against the API reference before use.

## Current limits

The repository has no automated test suite, Docker configuration, or CI configuration.
The source has no WebSocket notification transport, Redis cache, or dedicated health endpoint.
See the [implementation gaps](API_DOCUMENTATION.md#implementation-gaps) before use of the affected endpoints.

The package manifest declares the `ISC` license. The repository has no separate license file.
