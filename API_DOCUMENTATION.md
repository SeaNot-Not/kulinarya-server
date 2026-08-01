# Kulinarya API Documentation

## 📋 Overview

This document provides comprehensive documentation for the Kulinarya Recipe Sharing Platform API. The API follows RESTful conventions and uses JSON for request/response formats.

## 🔗 Base URL
```
http://localhost:4000/api
```

## 📊 Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

## 🔐 Authentication

All authenticated endpoints require a valid JWT token stored in an HTTP-only cookie named `kulinarya_auth_token`.

### Authentication Flow
1. User registers or logs in
2. Server sets `kulinarya_auth_token` cookie
3. Subsequent requests automatically include the cookie
4. Middleware validates the token on each request

## 📋 API Endpoints

### Authentication

#### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael" // Optional
}
```

**Response:**
```json
{
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
}
```

#### Verify Email
**GET** `/auth/verify-email?token=<verification_token>`

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

#### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
}
```

#### Get Authenticated User Details
**GET** `/auth/user-details`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Response:**
```json
{
  "message": "User details retrieved successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "profilePictureUrl": "https://supabase.url/profile.jpg"
    },
    "canPostRecipe": true
  }
}
```

#### Logout
**POST** `/auth/logout`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

#### Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

### Users

#### Get All Users (Admin Only)
**GET** `/users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "user_id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true
    }
  }
}
```

#### Get Specific User Data
**GET** `/users/:userId`

**Response:**
```json
{
  "message": "User data retrieved successfully",
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePictureUrl": "https://supabase.url/profile.jpg",
    "bio": "Food enthusiast from Manila"
  }
}
```

#### Update User Profile
**PUT** `/users/:userId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`
- Content-Type: `multipart/form-data`

**Form Data:**
- `firstName` (optional): Updated first name
- `lastName` (optional): Updated last name
- `middleName` (optional): Updated middle name
- `bio` (optional): Updated bio
- `profilePicture` (optional): New profile picture file

**Response:**
```json
{
  "message": "Profile updated successfully",
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Updated",
    "profilePictureUrl": "https://supabase.url/new-profile.jpg"
  }
}
```

#### Soft Delete User Account
**DELETE** `/users/:userId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Response:**
```json
{
  "message": "Account deleted successfully"
}
```

#### Get User Recipes
**GET** `/users/:userId/recipes`

**Query Parameters:**
- `search` (optional): Search term for recipe title/description
- `category` (optional): Filter by food category
- `origin` (optional): Filter by origin province
- `sortOrder` (optional): `newest` or `oldest` (default: `newest`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "message": "User recipes retrieved successfully",
  "data": {
    "userRecipes": [
      {
        "_id": "recipe_id",
        "title": "Adobo",
        "foodCategory": "dishes",
        "originProvince": "Manila",
        "mainPictureUrl": "https://supabase.url/adobo.jpg",
        "status": "approved",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalRecipes": 25
  }
}
```

#### Change Password
**POST** `/users/:userId/change-password`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

#### Get Top Sharers
**GET** `/users/top-sharers`

**Response:**
```json
{
  "message": "Top sharers retrieved successfully",
  "data": [
    {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "profilePictureUrl": "https://supabase.url/profile.jpg",
      "totalRecipes": 15
    }
  ]
}
```

### Recipes

#### Create Recipe
**POST** `/recipes`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`
- Content-Type: `multipart/form-data`

**Form Data:**
- `title`: Recipe title
- `foodCategory`: One of: `dishes`, `soup`, `drinks`, `desserts`, `pastries`
- `originProvince`: Origin province
- `description`: Recipe description
- `ingredients`: JSON string of ingredients array
- `procedure`: JSON string of procedure steps array
- `mainPicture`: Main recipe picture file
- `video` (optional): Recipe video file
- `additionalPictures` (optional): Array of additional picture files

**Ingredients JSON Format:**
```json
[
  {
    "quantity": 2,
    "unit": "cups",
    "name": "rice",
    "notes": "jasmine rice preferred"
  }
]
```

**Procedure JSON Format:**
```json
[
  {
    "stepNumber": 1,
    "content": "Wash the rice thoroughly"
  }
]
```

**Response:**
```json
{
  "message": "Recipe created successfully",
  "data": {
    "_id": "recipe_id",
    "title": "Adobo",
    "foodCategory": "dishes",
    "originProvince": "Manila",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Approved Recipes
**GET** `/recipes`

**Query Parameters:**
- `search` (optional): Search term
- `category` (optional): Filter by food category
- `origin` (optional): Filter by origin province
- `sortOrder` (optional): `newest` or `oldest` (default: `newest`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `userId` (optional): Filter by specific user

**Response:**
```json
{
  "message": "Recipes retrieved successfully",
  "data": {
    "recipes": [
      {
        "_id": "recipe_id",
        "title": "Adobo",
        "byUser": {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Doe",
          "profilePictureUrl": "https://supabase.url/profile.jpg"
        },
        "mainPictureUrl": "https://supabase.url/adobo.jpg",
        "foodCategory": "dishes",
        "isFeatured": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "totalComments": 5,
        "totalReactions": 20,
        "heartCount": 15,
        "droolCount": 3,
        "neutralCount": 2,
        "totalViews": 150,
        "totalEngagement": 175
      }
    ],
    "totalApprovedRecipes": 100,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "hasNextPage": true
    }
  }
}
```

#### Get Pending Recipes (Admin Only)
**GET** `/recipes/pending`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>` (Admin role required)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "message": "Pending recipes retrieved successfully",
  "data": {
    "pendingRecipesData": [
      {
        "_id": "recipe_id",
        "title": "New Recipe",
        "byUser": {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalPendingRecipes": 5,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false
    }
  }
}
```

#### Get Featured Recipes
**GET** `/recipes/featured`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "message": "Featured recipes retrieved successfully",
  "data": {
    "featuredRecipesData": [
      {
        "_id": "recipe_id",
        "title": "Featured Adobo",
        "byUser": {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Doe"
        },
        "mainPictureUrl": "https://supabase.url/adobo.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalFeaturedRecipes": 10,
    "page": 1,
    "limit": 10
  }
}
```

#### Get Top Engaged Recipes
**GET** `/recipes/top-engaged`

**Response:**
```json
{
  "message": "Top engaged recipes retrieved successfully",
  "data": [
    {
      "_id": "recipe_id",
      "title": "Popular Adobo",
      "byUser": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "mainPictureUrl": "https://supabase.url/adobo.jpg",
      "totalReactions": 50,
      "totalComments": 25,
      "totalViews": 300,
      "totalEngagement": 375,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Specific Recipe
**GET** `/recipes/:recipeId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>` (optional, for user reaction data)

**Response:**
```json
{
  "message": "Recipe retrieved successfully",
  "data": {
    "_id": "recipe_id",
    "title": "Adobo",
    "foodCategory": "dishes",
    "originProvince": "Manila",
    "mainPictureUrl": "https://supabase.url/adobo.jpg",
    "additionalPicturesUrls": ["url1", "url2"],
    "videoUrl": "https://supabase.url/video.mp4",
    "description": "Classic Filipino adobo recipe",
    "ingredients": [
      {
        "quantity": 2,
        "unit": "cups",
        "name": "rice",
        "notes": "jasmine rice"
      }
    ],
    "procedure": [
      {
        "stepNumber": 1,
        "content": "Wash the rice"
      }
    ],
    "byUser": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "profilePictureUrl": "https://supabase.url/profile.jpg"
    },
    "status": "approved",
    "isFeatured": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "totalComments": 5,
    "totalReactions": 20,
    "userReaction": "heart",
    "totalViews": 150
  }
}
```

#### Update Recipe
**PUT** `/recipes/:recipeId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`
- Content-Type: `multipart/form-data`

**Form Data:** (Same as create, all fields optional for update)

**Response:**
```json
{
  "message": "Recipe updated successfully",
  "data": {
    "_id": "recipe_id",
    "title": "Updated Adobo",
    "status": "pending", // Reset to pending after update
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Soft Delete Recipe
**DELETE** `/recipes/:recipeId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Response:**
```json
{
  "message": "Recipe deleted successfully"
}
```

#### Toggle Recipe Feature (Admin Only)
**PATCH** `/recipes/:recipeId/feature`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>` (Admin role required)

**Response:**
```json
{
  "message": "Recipe featured status updated",
  "data": {
    "_id": "recipe_id",
    "title": "Adobo",
    "isFeatured": true
  }
}
```

### Reactions

#### Add Reaction to Recipe
**POST** `/reactions`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Request Body:**
```json
{
  "recipeId": "recipe_id",
  "reaction": "heart" // or "drool" or "neutral"
}
```

**Response:**
```json
{
  "message": "Reaction added successfully",
  "data": {
    "_id": "reaction_id",
    "reaction": "heart",
    "fromPost": "recipe_id",
    "byUser": "user_id"
  }
}
```

#### Get Top Reacted Recipes
**GET** `/reactions/top-reacted`

**Response:**
```json
{
  "message": "Top reacted recipes retrieved successfully",
  "data": [
    {
      "_id": "recipe_id",
      "title": "Popular Recipe",
      "byUser": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "mainPictureUrl": "https://supabase.url/recipe.jpg",
      "totalReactions": 50,
      "heartCount": 40,
      "droolCount": 8,
      "neutralCount": 2,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Reactions for Specific Recipe
**GET** `/reactions/:recipeId`

**Response:**
```json
{
  "message": "Reactions retrieved successfully",
  "data": {
    "reactions": [
      {
        "_id": "reaction_id",
        "reaction": "heart",
        "byUser": {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Doe",
          "profilePictureUrl": "https://supabase.url/profile.jpg"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalReactions": 20,
    "heartCount": 15,
    "droolCount": 3,
    "neutralCount": 2
  }
}
```

### Comments

#### Add Comment to Recipe
**POST** `/comments`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Request Body:**
```json
{
  "recipeId": "recipe_id",
  "content": "This looks delicious!"
}
```

**Response:**
```json
{
  "message": "Comment added successfully",
  "data": {
    "_id": "comment_id",
    "content": "This looks delicious!",
    "fromPost": "recipe_id",
    "byUser": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "profilePictureUrl": "https://supabase.url/profile.jpg"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Comments for Recipe
**GET** `/comments/:recipeId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "_id": "comment_id",
        "content": "This looks delicious!",
        "byUser": {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Doe",
          "profilePictureUrl": "https://supabase.url/profile.jpg"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalComments": 25,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 3,
      "hasNextPage": true
    }
  }
}
```

#### Update Comment
**PUT** `/comments/:commentId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

**Response:**
```json
{
  "message": "Comment updated successfully",
  "data": {
    "_id": "comment_id",
    "content": "Updated comment content",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Soft Delete Comment
**DELETE** `/comments/:commentId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

### Moderation (Admin Only)

#### Get Pending Moderations
**GET** `/moderations/pending`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>` (Admin role required)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "message": "Pending moderations retrieved successfully",
  "data": {
    "moderations": [
      {
        "_id": "moderation_id",
        "forPost": {
          "_id": "recipe_id",
          "title": "New Recipe",
          "byUser": {
            "_id": "user_id",
            "firstName": "John",
            "lastName": "Doe"
          },
          "createdAt": "2024-01-01T00:00:00.000Z"
        },
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalPendingModerations": 5,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false
    }
  }
}
```

#### Moderate Recipe
**POST** `/moderations/:recipeId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>` (Admin role required)

**Request Body:**
```json
{
  "status": "approved", // or "rejected"
  "notes": "Great recipe! Approved." // Optional
}
```

**Response:**
```json
{
  "message": "Recipe moderated successfully",
  "data": {
    "_id": "moderation_id",
    "status": "approved",
    "moderatedBy": "admin_user_id",
    "notes": "Great recipe! Approved.",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

### Notifications

#### Get User Notifications
**GET** `/notifications`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "type": "moderation",
        "content": "Your recipe 'Adobo' has been approved!",
        "fromPost": "recipe_id",
        "isRead": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalNotifications": 15,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 2,
      "hasNextPage": true
    }
  }
}
```

#### Mark All Notifications as Read
**PATCH** `/notifications/read-all`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Response:**
```json
{
  "message": "All notifications marked as read"
}
```

#### Mark Specific Notification as Read
**PATCH** `/notifications/:notificationId/read`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Response:**
```json
{
  "message": "Notification marked as read",
  "data": {
    "_id": "notification_id",
    "isRead": true,
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Soft Delete Notification
**DELETE** `/notifications/:notificationId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>`

**Response:**
```json
{
  "message": "Notification deleted successfully"
}
```

### Announcements

#### Get All Announcements (Admin Only)
**GET** `/announcements`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>` (Admin role required)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "message": "Announcements retrieved successfully",
  "data": {
    "announcements": [
      {
        "_id": "announcement_id",
        "title": "System Maintenance",
        "content": "Scheduled maintenance on Sunday",
        "isActive": true,
        "createdBy": {
          "_id": "admin_id",
          "firstName": "Admin",
          "lastName": "User"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalAnnouncements": 5,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false
    }
  }
}
```

#### Get Active Announcements
**GET** `/announcements/active`

**Response:**
```json
{
  "message": "Active announcements retrieved successfully",
  "data": [
    {
      "_id": "announcement_id",
      "title": "New Feature",
      "content": "Check out our new recipe sharing feature!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Announcement (Admin Only)
**POST** `/announcements`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>` (Admin role required)

**Request Body:**
```json
{
  "title": "System Maintenance",
  "content": "Scheduled maintenance on Sunday from 2-4 AM",
  "isActive": true
}
```

**Response:**
```json
{
  "message": "Announcement created successfully",
  "data": {
    "_id": "announcement_id",
    "title": "System Maintenance",
    "content": "Scheduled maintenance on Sunday from 2-4 AM",
    "isActive": true,
    "createdBy": "admin_user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Announcement (Admin Only)
**PUT** `/announcements/:announcementId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>` (Admin role required)

**Request Body:**
```json
{
  "title": "Updated Maintenance Schedule",
  "content": "Maintenance rescheduled to Monday",
  "isActive": false
}
```

**Response:**
```json
{
  "message": "Announcement updated successfully",
  "data": {
    "_id": "announcement_id",
    "title": "Updated Maintenance Schedule",
    "content": "Maintenance rescheduled to Monday",
    "isActive": false,
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Soft Delete Announcement (Admin Only)
**DELETE** `/announcements/:announcementId`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>` (Admin role required)

**Response:**
```json
{
  "message": "Announcement deleted successfully"
}
```

### Platform Visits (Analytics)

#### Track Platform Visit
**POST** `/platform-visits`

**Response:**
```json
{
  "message": "Platform visit tracked successfully",
  "data": {
    "_id": "visit_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Platform Visit Statistics
**GET** `/platform-visits`

**Query Parameters:**
- `startDate` (optional): Start date in ISO format
- `endDate` (optional): End date in ISO format

**Response:**
```json
{
  "message": "Platform visits retrieved successfully",
  "data": {
    "totalVisits": 1500,
    "dailyVisits": [
      {
        "date": "2024-01-01",
        "count": 50
      }
    ],
    "monthlyVisits": [
      {
        "month": "January 2024",
        "count": 1500
      }
    ]
  }
}
```

### Post Views

#### Track Post View
**POST** `/post-views`

**Headers:**
- Cookie: `kulinarya_auth_token=<token>` (optional)

**Request Body:**
```json
{
  "recipeId": "recipe_id"
}
```

**Response:**
```json
{
  "message": "Post view tracked successfully",
  "data": {
    "_id": "view_id",
    "fromPost": "recipe_id",
    "byUser": "user_id", // or null if anonymous
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Post Views for Recipe
**GET** `/post-views/:recipeId`

**Response:**
```json
{
  "message": "Post views retrieved successfully",
  "data": {
    "totalViews": 150,
    "views": [
      {
        "_id": "view_id",
        "byUser": {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Get Top Viewed Posts
**GET** `/post-views/top`

**Response:**
```json
{
  "message": "Top viewed posts retrieved successfully",
  "data": [
    {
      "_id": "recipe_id",
      "title": "Popular Recipe",
      "byUser": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "mainPictureUrl": "https://supabase.url/recipe.jpg",
      "totalViews": 300,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 📝 Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | Authentication required or invalid |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## 🔄 Rate Limiting

- Email verification resend: 3 attempts per hour
- Password reset requests: 5 attempts per hour
- API requests: Configurable per endpoint

## 📁 File Upload Specifications

### Supported File Types
- **Images**: JPEG, PNG, WebP
- **Videos**: MP4, MOV

### Size Limits
- Profile pictures: 2MB max
- Recipe images: 2MB max each
- Recipe videos: 50MB max

### Upload Endpoints
- `PUT /users/:userId` - Profile picture
- `POST /recipes` - Recipe media
- `PUT /recipes/:recipeId` - Recipe media updates

## 🔐 Role-Based Access Control

### User Roles
| Role | Permissions |
|------|-------------|
| **User** | Basic recipe viewing, commenting, reacting |
| **Creator** | All user permissions + recipe creation |
| **Admin** | All permissions + moderation, user management |

### Protected Endpoints
- **Admin only**: User management, moderation, announcements
- **Creator only**: Recipe creation, updating own recipes
- **Authenticated users**: Comments, reactions, profile updates
- **Public**: Recipe viewing, platform visits

## 📈 Pagination

All list endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Pagination response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true
  }
}
```

## 🔍 Search & Filtering

### Recipe Search
- `search`: Searches in title and description
- `category`: Filters by food category
- `origin`: Filters by origin province
- `sortOrder`: `newest` or `oldest`

### User Recipe Search
- All recipe search parameters plus user-specific filtering

## 🎯 Testing

### API Testing Collection
The project includes a Bruno API collection in `/kulinarya-api/` with:
- All endpoints pre-configured
- Environment variables setup
- Request examples
- Response validation

### Test Environment Setup
1. Set `NODE_ENV=test`
2. Use test database
3. Mock external services
4. Run integration tests

---

*This API documentation is automatically generated and should be kept updated with code changes. For the latest information, refer to the source code and Bruno collection.*