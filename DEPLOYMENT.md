# Deployment and runtime setup

Documentation review date: 2026-11-09.

This guide describes the runtime configuration in the repository.
The repository does not supply Docker files, a process supervisor, a reverse proxy, or a CI pipeline.
The earlier Docker and AWS examples were not verified deployment configurations.

## Required services

- A Node.js runtime and npm that can install the locked dependencies.
- A reachable MongoDB database.
- A Supabase project with the storage bucket `kulinarya-bucket`.
- A Gmail SMTP account for verification and password reset messages.
- The URL of the client application.

The manifest has no `engines` field and no pinned Node.js runtime file.
Select a runtime for the target host and do an installation test before deployment.
Do not treat a minimum runtime from an older guide as a tested project requirement.

## Environment variables

Create `.env` in the repository root for local use. The repository does not contain `.env.example`.
The `.gitignore` file excludes `.env`.
Replace the example values before you start the server.

| Variable | Function |
| --- | --- |
| `PORT` | HTTP listener port. Default: `4000`. |
| `NODE_ENV` | Exact value `prod` selects production configuration. Other values select development configuration. |
| `MONGO_URI_DEV` | MongoDB URI for modes other than `prod`. |
| `MONGO_URI_PROD` | MongoDB URI for `prod` mode. |
| `CLIENT_URL_DEV` | Allowed client origin and email link base for modes other than `prod`. |
| `CLIENT_URL_PROD` | Allowed client origin and email link base for `prod` mode. |
| `JWT_SECRET` | Secret used to sign and verify JWTs. |
| `GMAIL_USER` | SMTP account and email sender. |
| `GMAIL_PASS` | SMTP account password or app password. |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server key. Keep this value on the server. |
| `INITIAL_ADMIN_EMAIL` | Email for initial administrator creation through `GET /`. |
| `INITIAL_ADMIN_PASSWORD` | Password for initial administrator creation through `GET /`. |

Example local file:

```dotenv
PORT=4000
NODE_ENV=dev
MONGO_URI_DEV=mongodb://127.0.0.1:27017/kulinarya
CLIENT_URL_DEV=http://localhost:5173
JWT_SECRET=replace-with-a-private-random-value
GMAIL_USER=replace-with-your-smtp-account
GMAIL_PASS=replace-with-your-smtp-password
SUPABASE_URL=https://replace-with-your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-your-server-key
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=replace-with-a-private-admin-password
```

The client URL must match the actual browser origin. The example port is not a fixed client requirement.
Use the port that the client development server reports.

For production, set `NODE_ENV=prod`, `MONGO_URI_PROD`, and `CLIENT_URL_PROD`.
The conventional value `NODE_ENV=production` does not select this application's production branch.
It selects development URLs and nonsecure cookie settings.

The source does not read `MONGO_URI`, `CLIENT_URL`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, or `EMAIL_PASSWORD` from the environment.
It also does not read `EMAIL_FROM`, `SUPABASE_ANON_KEY`, or `SUPABASE_BUCKET_NAME`.

Source: [environmentConditions.js](src/utils/environmentConditions.js), [emailTransporter.js](src/utils/emailTransporter.js), and [supabase.js](src/utils/supabase.js).

## Local startup

1. Open a terminal in this repository.
2. Install the locked dependencies:

   ```sh
   npm ci
   ```

3. Create `.env` with the required values.
4. Make sure that MongoDB is reachable from the server process.
5. Make sure that the Supabase project and bucket exist.
6. Start the server:

   ```sh
   npm run dev
   ```

7. Wait for the database connection and listener messages.
8. Request `GET /api/recipes/approved?sortOrder=newest&page=1&limit=10`.

A database failure terminates the process. Supabase configuration is read during module import.
A response from the recipe list does not prove email or media transfer operation.
Do separate checks of those functions with a test account.

## Initial administrator

The server does not create an administrator during startup.
The root route calls `User.initialLogin()` on each `GET /` request.

1. Set `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` before the first root request.
2. Start the server against the intended database.
3. Send one `GET /` request.
4. If no `admin` account exists, expect HTTP 201 and `Initial Login Success!`.
5. Log in with the configured account to confirm access.

Later root requests return `Backend is running` when an administrator already exists.
Do not use this route as an independent health or readiness check.
The account creation method also marks the initial email as verified.

## Storage setup

1. Create a Supabase storage bucket named `kulinarya-bucket`.
2. Configure public access for media URLs used by the client.
3. Store the project URL and service role key in the server environment.
4. Send a small picture through a test recipe request.
5. Make sure that the returned public URL opens from the client.
6. Do a separate check of media replacement and removal.

The upload helper creates object paths under `profile_pictures`, `recipe_pictures`, and `recipe_videos`.
A bucket environment variable cannot change the bucket name without a source change.
Read the [media limits](API_DOCUMENTATION.md#media-uploads) before upload tests.

The source does not compress images or divide uploads into chunks.
Multer keeps each request file in memory. Include concurrent uploads in host memory estimates.

## Email setup

1. Set `GMAIL_USER` and `GMAIL_PASS` for the account accepted by Gmail SMTP.
2. Set the selected client URL to the actual client origin.
3. Register a disposable test account.
4. Make sure that the verification email arrives.
5. Open the verification link and confirm the response.
6. Do a separate password reset test.

The SMTP host is hardcoded as `smtp.gmail.com`.
A Resend account or `EMAIL_HOST` value does not change the transport.
Password reset uses a stored token and an email token generated in different functions.
An integration test must confirm that the mailed token is accepted.

## Production process

1. Prepare the target host and a tested Node.js runtime.
2. Install dependencies with `npm ci`.
3. Supply the environment variables through the host secret configuration.
4. Set `NODE_ENV=prod`.
5. Start the process with `npm start`.
6. Configure the host process manager and HTTPS routing for the API.
7. Set the client `VITE_APP_ENV=prod`.
8. Set `VITE_API_URL_PROD` in the client to the API origin, without `/api` or a trailing slash.
9. Make sure that credentialed browser requests reach the API.
10. Do the application checks below before release.

The repository has no build step. There is no `/health` route.
A host process manager, TLS configuration, and restart policy require configuration outside this repository.
No specific cloud host is required by the source.

In `prod` mode, the cookie uses `secure: true` and `sameSite: "none"`.
Use HTTPS for browser access. Browser cookie policy can also affect requests between different sites.
The server allows the selected client origin through CORS with credentials.

## Application checks

Use a disposable database and test media for destructive checks.

- Do a check of the public approved recipe list.
- Do a check of registration, verification, login, and logout.
- Do a check of the authentication cookie on protected requests.
- Do a check of recipe creation, moderation, update, and deletion.
- Do a check of picture and video retrieval from the client.
- Do a check of comments, reactions, and notification retrieval.
- Do a check of moderator access and rejected unauthorized requests.
- Do a check of password reset from the received email link.

`npm test` is a failing placeholder. The repository has no lint script or automated deployment checks.
The [Bruno collection](kulinarya-api) needs request corrections before use.
Read the [API implementation gaps](API_DOCUMENTATION.md#implementation-gaps) for current limits.

## Logs and maintenance

Morgan writes HTTP request logs. The process also prints a status message every 30 seconds.
That message does not test database, email, or storage availability.

The current database connection code prints the MongoDB URI.
The registration model prints registration input, including the supplied password.
Review and redact these logs before collection or disclosure.
The documentation does not provide a log redaction implementation.

Use the database provider's backup and restore process for the selected deployment.
The repository has no migration runner, backup script, or restore test.
For a schema change, prepare a separate migration plan and verify it on a database copy.

## Fault diagnosis

| Symptom | Action |
| --- | --- |
| Database connection fails | Do a check of the selected URI, database availability, and network access. |
| Production uses development URLs | Set the exact value `NODE_ENV=prod`. |
| Browser requests fail through CORS | Compare the browser origin with the selected `CLIENT_URL_DEV` or `CLIENT_URL_PROD`. |
| Protected requests return 401 | Do a check of cookie storage, credential settings, token expiry, and `JWT_SECRET`. |
| Media upload fails | Do a check of the bucket name, server key, file type, and size. |
| Email fails | Do a check of `GMAIL_USER`, `GMAIL_PASS`, and SMTP access. |
| A documented old route returns 404 | Use the current path and method in the [API reference](API_DOCUMENTATION.md). |
| A large picture returns 500 | Review the known `maxSize` error in the upload helper. |
