This API allows users to create, read, update, and delete blog posts. It uses Node.js, Express, SQLite, and JWT for authentication.

### Installation
** Clone the repository:

git clone https://github.com/vkonga/zuai-backend.git
cd zuai-backend
### Install dependencies:
npm install sqlite3 sqlite express bcrypt jwtwebtoken cors

### API Endpoints
### User Registration

### POST /signup/
Body:
json
Copy code
{
  "id": "unique_id",
  "username": "your_username",
  "password": "your_password",
  "role": "user"
}
Response: Success or error message.
User Login

### POST /login/
Body:
json
Copy code
{
  "username": "your_username",
  "password": "your_password"
}
Response: JWT token or error message.

Create Post

### POST /post/
Headers: Authorization: Bearer <jwt_token>
Body:
json
Copy code
{
  "id": "unique_id",
  "title": "Post Title",
  "content": "Post content",
  "createdAt": "ISO_date_string"
}
Response: Success or error message.

Get All Posts

## GET /posts/
Headers: Authorization: Bearer <jwt_token>
Response: List of posts or error message.

Get a Specific Post

### GET /posts/:id/
Headers: Authorization: Bearer <jwt_token>
Response: Post details or error message.

Update Post

### PUT /posts/:id/
Headers: Authorization: Bearer <jwt_token>
Body:
json
Copy code
{
  "title": "Updated Title",
  "content": "Updated content",
  "createdAt": "ISO_date_string"
}
Response: Success or error message.

Delete Post

### DELETE /posts/:id/
Headers: Authorization: Bearer <jwt_token>
Response: Success or error message.


Running the Server
Start the server:
Server URL: http://localhost:5000/
