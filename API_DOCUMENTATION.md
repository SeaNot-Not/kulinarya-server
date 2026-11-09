# API reference

Documentation review date: 2026-11-09.

The default local base URL is `http://localhost:4000/api`.
The tables below use paths relative to `/api`.
Read [src/routes](src/routes), [src/controllers](src/controllers), and [src/models](src/models) for the current implementation.

## Request and access rules

Send JSON bodies with `Content-Type: application/json`, except for media requests.
Send media requests as `multipart/form-data`. Let the HTTP client set the multipart boundary.
Replace path parameters, such as `:recipeId`, with actual document IDs.

Protected routes read the `kulinarya_auth_token` cookie. They do not read a bearer token from the `Authorization` header.
After login, keep the response cookie for later requests. Browser clients must permit credentials.

The access terms in this guide have these meanings:

| Term | Meaning |
| --- | --- |
| Public | The route has no authentication middleware. |
| Optional cookie | A missing cookie is permitted. An invalid cookie still causes an error. |
| User | The route requires a valid authentication cookie. |
| Moderator | The route requires a valid cookie and the `admin` or `creator` role. |
| Owner | The model also compares the current user with the record owner. |

These terms describe source checks. They do not confirm a security assessment.
Additional model checks and known gaps appear below.

## Responses

Most controllers return `success`, `statusCode`, and `message` with endpoint-specific data fields.
There is no common `data` field across all endpoints.
For example, recipe creation returns `result`. Approved recipe lists return `recipes` and `pagination`.

The error middleware usually returns this structure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errors": [{ "path": "title", "message": "Example validation message" }]
}
```

The `errors` field is optional. Its item structure differs between Zod and Mongoose errors.
The fallback 404 response is `{ "error": "Not Found" }`.
`verify-reset-token` returns `success` and `message` without `statusCode`.
The user list returns an array. Overall comment and reaction endpoints return count objects.
The feature toggle returns `message` and `recipe`.

| Status | Typical use |
| --- | --- |
| `200` | Retrieval, update, or successful authentication. |
| `201` | Registration, creation, or a new reaction. |
| `400` | Invalid input or a rejected operation. |
| `401` | Missing token, invalid token, or some ownership failures. |
| `403` | Role failure or some prohibited operations. |
| `404` | Missing record or unknown route. |
| `429` | A duplicate visit or view within the counting interval. |
| `500` | An unexpected server or external service error. |

## Authentication

Source: [authRoutes.js](src/routes/authRoutes.js), [authController.js](src/controllers/authController.js), and [userModel.js](src/models/userModel.js).

| Method | Path | Access | Request |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | JSON: `email`, `password`, `firstName`, `lastName`. |
| `GET` | `/auth/verify-email` | Public | Query: `token`. |
| `POST` | `/auth/resend-verification` | Public | JSON: `email`. |
| `POST` | `/auth/login` | Public | JSON: `email`, `password`. |
| `POST` | `/auth/logout` | Public | No body. Clears the cookie. |
| `GET` | `/auth/user-details` | User | No body. |
| `POST` | `/auth/forgot-password` | Public | JSON: `email`. |
| `POST` | `/auth/reset-password` | Public | Query: `token`. JSON: `newPassword`. |
| `POST` | `/auth/verify-reset-token` | Public | JSON: `token`. |

Registration requires a password of 8 to 100 characters.
The password must contain an uppercase letter, a lowercase letter, a number, and a special character.
First and last names require at least two characters.
Read [userValidations.js](src/validations/userValidations.js) for the full field rules.

Registration sends a verification email and sets a cookie after account creation.
Login sets a seven-day cookie and returns `data.user` with `_id`, `email`, and `isEmailVerified`.
Login does not reject an unverified account.
Email verification tokens expire after one hour. Password reset tokens expire after 15 minutes.

The mail attempt model permits three attempts per email and request type per server calendar day.
It applies a five-minute interval between accepted attempts.
These checks apply to verification resends and password reset requests. They are not a general API request limit.

`GET /auth/user-details` returns `user` at the top level.
It also returns `canPostRecipe`, which is true when the pending moderation count is less than three.
The recipe creation method does not enforce this limit.

### Login example

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "reader@example.com",
  "password": "ReplaceWithYourTestPassword"
}
```

Use an account from the test database. Do not use the example password as an account credential.

## Users

Source: [userRoutes.js](src/routes/userRoutes.js) and [userModel.js](src/models/userModel.js).

| Method | Path | Access | Request or result |
| --- | --- | --- | --- |
| `GET` | `/users/all` | User | Returns a user array. No role check is installed. |
| `GET` | `/users/top-sharers` | Public | Returns `topSharers`. |
| `GET` | `/users/:userId` | User | Returns `user`. |
| `PATCH` | `/users/:userId/update` | User | Profile fields and optional `profilePictureUrl` file. |
| `DELETE` | `/users/:userId/soft-delete` | User | No body. See the deletion limits below. |
| `GET` | `/users/:userId/recipes` | User | Returns `userRecipes` and `totalRecipes`. |
| `PATCH` | `/users/:userId/change-password` | User, owner | JSON: `currentPassword`, `newPassword`. |

Use multipart form data for a profile picture. The file field is named `profilePictureUrl`.
The update schema permits `firstName`, `middleName`, `lastName`, `bio`, `profilePictureUrl`, `password`, `role`, `isEmailVerified`, and `deletedAt`.
This list describes the current schema. The model does not compare `:userId` with the authenticated user for profile updates.
It also does not apply a role check to those updates.

The user list returns names, email, role, and creation time for nondeleted users.
The profile retrieval method returns email, names, picture URL, and biography.
The top sharer query returns up to five users ranked by approved recipe count.

The deletion model rejects self-deletion and deletion of an `admin` account.
It does not enforce an administrator role for the caller.
Do not describe account deletion as an administrator-only or self-service function.

The user recipe list accepts `search`, `origin`, `category`, `sortOrder`, `page`, and `limit`.
Its defaults are `sortOrder=newest`, `page=1`, and `limit=10`.
It excludes deleted recipes but does not apply an approved-only filter.

## Recipes

Source: [recipeRoutes.js](src/routes/recipeRoutes.js) and [recipeModel.js](src/models/recipeModel.js).

| Method | Path | Access | Request or result |
| --- | --- | --- | --- |
| `POST` | `/recipes` | User | Multipart recipe fields. Returns the recipe in `result`. |
| `PATCH` | `/recipes/:recipeId` | User, owner | Multipart recipe fields. Returns `result`. |
| `DELETE` | `/recipes/:recipeId/soft-delete` | User, owner | Sets `deletedAt`. Returns `result`. |
| `PATCH` | `/recipes/:recipeId/toggle-feature` | Moderator | No body. Only approved recipes can be featured. |
| `GET` | `/recipes/pending` | Moderator | Returns `pendingRecipesData`, `totalPendingRecipes`, and `pagination`. |
| `GET` | `/recipes/approved` | Public | Returns `recipes`, `totalApprovedRecipes`, and `pagination`. |
| `GET` | `/recipes/featured` | Public | Returns `featuredRecipesData`, `totalFeaturedRecipes`, `page`, and `limit`. |
| `GET` | `/recipes/top-engaged` | Public | Returns `topEngagedRecipes`. |
| `GET` | `/recipes/approved/:recipeId` | Optional cookie | Returns `recipe`. Includes the user reaction when authenticated. |
| `GET` | `/recipes/edit/:recipeId` | User | Returns `recipe`. The ownership condition needs correction. |

`GET /api/recipes` and `GET /api/recipes/:recipeId` are not defined routes.
Use `/approved` and `/approved/:recipeId` for public reads.

### Recipe request fields

| Field | Format and rule |
| --- | --- |
| `title` | Text. At least two characters. |
| `foodCategory` | One of `dishes`, `soup`, `drinks`, `desserts`, or `pastries`. |
| `originProvince` | Nonempty text. |
| `description` | Optional text. Maximum 2,000 characters. |
| `ingredients` | JSON string. One to 50 ingredient objects. |
| `procedure` | JSON string. Supply one to 30 step objects. |
| `mainPicture` | Optional file. At most one. |
| `additionalPictures` | Optional files. At most five per request. |
| `video` | Optional MP4 file. At most one. |
| `additionalPicturesUrls` | Update only: JSON string of existing picture URLs to retain. |

The server supplies the author ID from the cookie.
Each ingredient has a string `quantity`, an allowed `unit`, and a nonempty `name`.
Allowed units are `g`, `kg`, `ml`, `l`, `cup`, `tbsp`, `tsp`, and `pcs`.
Each step has an integer `stepNumber` of at least one and a `content` string of at most 500 characters.

Example text values for multipart fields:

```text
title: Vegetable Soup
foodCategory: soup
originProvince: Batangas
ingredients: [{"quantity":"1","unit":"cup","name":"Vegetables"}]
procedure: [{"stepNumber":1,"content":"Cook the vegetables in water."}]
```

Do not send `ingredients` or `procedure` as JSON arrays in a JSON request body.
The model calls `JSON.parse()` on the supplied values.
Although the procedure validation field is optional, the model changes an omitted value to an empty array.
Supply complete procedure data to avoid different schema behavior.

Recipe updates reset moderation to `pending`.
The update method changes omitted ingredient, procedure, and retained picture fields to empty arrays.
It can delete existing pictures when retained URLs are absent.
Its video removal condition also needs review. Use disposable media for update tests.

### Recipe list queries

Approved, pending, and featured lists use `extractQueryParams()`.

| Parameter | Effect |
| --- | --- |
| `page` | Page number. Default 1; minimum 1. |
| `limit` | Page size. Default 10; range 1 to 100. |
| `sortOrder` | `newest` sorts by `updatedAt` descending. Other or omitted values sort ascending. |
| `search` | Search the title and description. |
| `category` | Match `foodCategory` without case sensitivity. |
| `origin` | Match `originProvince` without case sensitivity. |
| `userId` | Approved list only: restrict the author. |
| `forFeaturedRecipes` | Approved list only: place featured recipes first when the value is truthy. |
| `forRankingRecipes` | Approved list only: sort by engagement when the value is truthy. |

The flags use JavaScript truthiness. A query value of `false` is a nonempty string and still enables the flag.
Omit a flag to disable it.

Example:

```http
GET /api/recipes/approved?page=1&limit=10&sortOrder=newest&category=soup
```

## Reactions

Source: [reactionRoutes.js](src/routes/reactionRoutes.js) and [reactionModel.js](src/models/reactionModel.js).

| Method | Path | Access | Request or result |
| --- | --- | --- | --- |
| `GET` | `/reactions/overall-reactions` | Public | Returns the overall reaction counts. |
| `GET` | `/reactions/top-reacted` | Public | Returns `data.topReactedPosts`. |
| `GET` | `/reactions/:recipeId` | Public | Returns `reactions`, `totalReactions`, and `cursor`. |
| `POST` | `/reactions/:recipeId/toggle` | User | JSON: `reaction`. |

Use `heart`, `drool`, or `neutral` as the reaction value.
A repeated reaction removes the current reaction through a soft delete.
A different reaction changes the current value. A new reaction returns HTTP 201; other changes return HTTP 200.

The controller and model use different result field names. Do not rely on the mutation response for reaction or notification data.
The top reaction model uses the current month. The controller accepts `timeframe`, but the model ignores it.

## Comments

Source: [commentRoutes.js](src/routes/commentRoutes.js) and [commentModel.js](src/models/commentModel.js).

| Method | Path | Access | Request or result |
| --- | --- | --- | --- |
| `GET` | `/comments/overall-comments` | Public | Returns `totalComments`. |
| `GET` | `/comments/:recipeId` | Public | Returns `comments` and `cursor`. |
| `POST` | `/comments/:recipeId` | User | JSON: `content`. Returns `comment` and notification data. |
| `PATCH` | `/comments/:commentId` | User, owner | JSON: `content`. Returns `comment`. |
| `DELETE` | `/comments/:commentId/soft-delete` | User, owner | No body. |

Comment content requires 2 to 1,000 characters.
The update model does not create a notification, although the controller response message says that it does.

## Moderation

Source: [moderationRoutes.js](src/routes/moderationRoutes.js) and [moderationModel.js](src/models/moderationModel.js).

| Method | Path | Access | Request or result |
| --- | --- | --- | --- |
| `PATCH` | `/moderations/:moderationId` | Moderator | JSON: `status`, optional `notes`. Returns `moderation` and possible notification data. |
| `GET` | `/moderations/pending-count` | User; model requires moderator role | Returns `pendingModerationCount`. |
| `GET` | `/moderations/:recipeId` | User | Returns `moderation`. |

The update path uses a moderation ID. The retrieval path uses a recipe ID.
Use `pending`, `approved`, or `rejected` as the status.
If supplied, notes require 2 to 1,000 characters. Moderators cannot moderate their own recipes.

The pending-count route is an unanchored regular expression in the source.
Use the documented `/pending-count` path. Do not depend on its additional matches.
There is no `GET /moderations/pending` route. Use `GET /recipes/pending` to retrieve pending recipes.

## Notifications

Source: [notificationRoutes.js](src/routes/notificationRoutes.js) and [notificationModel.js](src/models/notificationModel.js).

| Method | Path | Access | Request or result |
| --- | --- | --- | --- |
| `GET` | `/notifications` | User | Returns `notifications` and `cursor` for the current user. |
| `GET` | `/notifications/unread-count` | User | Returns `unreadCount`. |
| `PATCH` | `/notifications/:notificationId/read` | User, recipient | No body. |
| `PATCH` | `/notifications/read-all` | User | No body. Marks the current user notifications as read. |
| `DELETE` | `/notifications/:notificationId/soft-delete` | User, recipient | No body. |

Clients retrieve notifications through HTTP. The API does not send them over a live connection.

## Announcements

Source: [announcementRoutes.js](src/routes/announcementRoutes.js) and [announcementModel.js](src/models/announcementModel.js).

| Method | Path | Access | Request or result |
| --- | --- | --- | --- |
| `POST` | `/announcements/create` | Moderator | JSON: `title`, `content`. Returns `announcement`. |
| `PATCH` | `/announcements/:announcementId` | Moderator | JSON: `title`, `content`, or Boolean `isActive`. |
| `DELETE` | `/announcements/:announcementId/soft-delete` | Moderator | No body. |
| `GET` | `/announcements` | Moderator | Returns `announcements`, including deleted records. |
| `GET` | `/announcements/activeAnnouncements` | Public | Returns active, nondeleted `announcements`. |
| `GET` | `/announcements/:announcementId` | User | Returns one nondeleted `announcement`. |

Creation requires a nonempty title and at least two content characters.
The server supplies `createdBy` from the authentication token.
Updates do not use the creation validation schema.

## Platform visits

Source: [platformVisitRoutes.js](src/routes/platformVisitRoutes.js) and [platformVisitModel.js](src/models/platformVisitModel.js).

| Method | Path | Access | Request or result |
| --- | --- | --- | --- |
| `POST` | `/platform-visits` | Optional cookie | JSON object. Returns `platformVisit`. |
| `GET` | `/platform-visits` | Public | Returns `totalVisits`, `userVisits`, and `guestVisits`. |

The model derives the visitor type from the cookie when `visitType` is absent.
It uses the token user ID for authenticated requests and `req.ip` for guest requests.
It also accepts `visitType`, `byUser`, and `byGuest` fields. Do not treat these records as verified unique visitors.
A repeat visit within one hour returns HTTP 429.

## Recipe views

Source: [postViewRoutes.js](src/routes/postViewRoutes.js) and [postViewModel.js](src/models/postViewModel.js).

| Method | Path | Access | Request or result |
| --- | --- | --- | --- |
| `POST` | `/post-views` | Optional cookie | JSON: `fromPost`, with optional visitor fields. Returns `postView`. |
| `GET` | `/post-views/top` | Public | Returns `totalPostViews` and `topViewedPosts`. |
| `GET` | `/post-views/:recipeId` | Public | Returns `recipeId` and `views`. |

Optional visitor fields are `viewType`, `byUser`, and `byGuest`.
The model derives defaults from the cookie and IP address.
A repeat view of the same recipe within one day returns HTTP 429.
The top view calculation uses the current month.

## Cursor pagination

Comments, reactions, and notifications accept `limit` and `cursor` query parameters.
Their default limit is 10.

1. Request the first set without a cursor.
2. Read the returned `cursor`.
3. Send that value as the next request cursor.
4. Stop when the response contains no items or a null cursor.

Notifications use `updatedAt`. Comments and reactions use `createdAt`.
The cursor is a timestamp, not an offset or document ID.
Items with the same timestamp can cross a page boundary. The queries do not use an ID tie-breaker.

## Media uploads

Source: [multerMiddleware.js](src/middleware/multerMiddleware.js), [handleSupabaseUpload.js](src/utils/handleSupabaseUpload.js), and the user and recipe models.

| Media | Field | Model configuration | Count per request |
| --- | --- | --- | --- |
| Profile picture | `profilePictureUrl` | JPEG or PNG, 2 MiB. | 1 |
| Main recipe picture | `mainPicture` | JPEG, JPG, PNG, or WebP, 2 MiB. | 1 |
| Additional recipe picture | `additionalPictures` | JPEG, JPG, PNG, or WebP, 2 MiB each. | 5 |
| Recipe video | `video` | MP4, 50 MiB. | 1 |

One MiB is 1,048,576 bytes.
Multer first applies a 50 MiB limit to each file and a shared MIME filter.
The model then supplies the media-specific limits to the storage helper.
MOV appears in model options, but the Multer filter rejects it.
An oversized picture can cause a server error because the helper error message refers to undefined `maxSize`.

Files use the `kulinarya-bucket` bucket and public URLs.
The server does not read `SUPABASE_BUCKET_NAME` or use an anonymous Supabase key.

## Implementation gaps

These gaps are visible in the source. This documentation update does not change runtime code.

| Area | Source behavior |
| --- | --- |
| Reaction result | The model returns `reactionData` and `notificationData`; the controller reads `reaction` and `notification`. |
| Edit recipe retrieval | The model compares a populated author document as text and rejects when its ownership condition is true. |
| Profile update | Authentication is required, but caller ownership and role checks are absent. |
| User deletion | The model rejects self-deletion and administrator targets. It does not require an administrator caller. |
| Password reset | The email function creates another token instead of receiving the token saved by the model. Reset acceptance needs an integration test. |
| Reset password validation | The reset method does not use the declared `resetPasswordSchema`. |
| Media update | Old files can be deleted before database validation or persistence succeeds. |
| Upload size error | The helper uses undefined `maxSize` in its oversized-file error. |
| Validation results | Several methods call `.parse()` but continue with the original input. Do not assume every schema transformation takes effect. |

A pending recipe count is used to calculate the `canPostRecipe` account flag.
The recipe creation method does not enforce that pending-count limit.
Do not describe this flag as a server-enforced submission limit.

## Bruno collection

[kulinarya-api](kulinarya-api) contains saved requests. It is not an automated test suite or an exact API specification.
Some requests contain old IDs, tokens, credentials, methods, or bodies. Use a test account and replace those values before use.

Known route differences include these examples:

| Saved request | Current route or format |
| --- | --- |
| `FeatureRecipe` | `PATCH /api/recipes/:recipeId/toggle-feature`. |
| `GetRecipeByID` | `GET /api/recipes/approved/:recipeId` for a public approved recipe. |
| `Get Top Reacted Post` | `GET /api/reactions/top-reacted`. |
| `Read All Notifications` | `PATCH /api/notifications/read-all`. |
| `PostNewRecipe` | Use multipart fields with JSON strings for arrays and cookie authentication. |

Do a check of each saved request against this guide and the route source.
Do not copy old bearer-token instructions into a browser client.
