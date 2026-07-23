# BlogAPI — Blogging Platform API

Step8Up Week-8 Assignment. A REST API for a blogging platform built with **Node.js**, **Express**, and **MySQL**. Users can register, log in, create/edit/delete their own posts, and browse posts filtered by category. A minimal front-end (`public/index.html`) demonstrates the API in action.

## Features

- JWT-based auth (register, login, logout) with httpOnly cookies
- Full CRUD on blog posts, restricted to the post's owner
- Category creation and filtering (`GET /api/posts?category=technology`)
- Seed script with sample users, categories, and posts

## Tech Stack

| Layer     | Tech                                  |
|-----------|----------------------------------------|
| Server    | Node.js, Express                       |
| Database  | MySQL                                  |
| Auth      | JWT                                    |
| Front-end | Vanilla HTML/CSS/JS                    |
| Hosting   | [Render](https://render.com)           |

## Project Structure

```
Step8Up_Week-8/
├── config/db.js             # MySQL connection pool
├── controllers/             # Route logic (auth, posts, categories)
├── middleware/auth.js       # JWT verification middleware
├── routes/                  # Express routers
├── sql/schema.sql           # Table definitions
├── public/index.html        # Front-end
├── seed.js                  # Sample data loader
├── server.js                # App entry point
├── render.yaml              # Render deployment blueprint
└── .env.example
```

## Installation Steps

1. **Clone the repository** and navigate into the project directory.

   ```bash
   git clone https://github.com/deedaryani/Step8Up_Week-8
   cd Step8Up_Week-8
   ```

2. **Copy the `.env.example` file** and rename it to `.env`, then update the values (DB credentials, JWT secret).
      ```bash
      cp .env.example .env
      ```

      To generate a random string for a **JWT Secret** use:

         
       node -e "console.log(require('crypto').randomBytes(12).toString('hex'))"
         

 

3. **Open MySQL and create the database:**

   ```bash
   mysql -u root -p
   ```

   ```sql
   CREATE DATABASE blog_platform;
   EXIT;
   ```

   Then load the schema:

   ```bash
   mysql -u root -p blog_platform < sql/schema.sql
   ```

4. **Install dependencies**

   ```bash
   npm i
   ```

5. **Seed the database with test data**

   ```bash
   npm run seed
   ```

   This creates two test users (`jason@example.com` / `olly@example.com`, password `password123`), three categories, and four posts.

6. **Run the application locally**

   ```bash
   npm run dev
   ```

   for auto-reload with nodemon.

7. **Visit the application in your browser**

   ```
   http://localhost:3001
   ```

## API Reference

Base URL: `/api`

### Auth

| Method | Endpoint         | Auth | Description                     |
|--------|------------------|------|----------------------------------|
| POST   | `/auth/register` | No   | `{ name, email, password }`      |
| POST   | `/auth/login`    | No   | `{ email, password }`            |
| POST   | `/auth/logout`   | No   | Clears the auth cookie           |
| GET    | `/auth/me`       | Yes  | Returns the current user         |

### Posts

| Method | Endpoint            | Auth | Description                                   |
|--------|---------------------|------|------------------------------------------------|
| GET    | `/posts`            | No   | List posts. Supports `?category=slug&page=&limit=` |
| GET    | `/posts/:id`        | No   | Get a single post                              |
| POST   | `/posts`             | Yes  | `{ title, content, category_id? }`             |
| PUT    | `/posts/:id`        | Yes  | Owner only. Any subset of `{ title, content, category_id }` |
| DELETE | `/posts/:id`        | Yes  | Owner only                                      |

### Categories

| Method | Endpoint       | Auth | Description             |
|--------|----------------|------|--------------------------|
| GET    | `/categories`  | No   | List all categories      |
| POST   | `/categories`  | Yes  | `{ name }`                |

Auth is checked via an httpOnly `token` cookie set on login/register, or a `Authorization: Bearer <token>` header (for Postman).


## Demo Video

https://1drv.ms/v/c/311ef8dff607ae23/IQAtXmxhFuWtS6TwSxhXwDyYAZelelHhm4ZlVZmcZJjFlIs?e=OENZDK

## Deployed Site



## Author
  Dee

## License
Apache License 2.0
