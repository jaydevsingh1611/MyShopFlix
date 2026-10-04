## ShopFlix

ShopFlix is a full-stack e-commerce and entertainment platform built with React on the frontend and Spring Boot on the backend. The application provides product browsing, movie browsing, authentication, search, cart management, watchlists, ordering, user profiles, and administrative management features.

### Features

- User registration and login
- JWT-based authentication with Spring Security
- Protected routes for authenticated users
- Product browsing by category
  - Electronics
  - Beauty & Grooming
  - Fashion
  - Kitchen & Storage
- Movie browsing
- Product and movie search
- Elasticsearch-powered search
- Shopping cart management
- Watch-later functionality for movies
- Multi-step checkout flow
  - Cart review
  - Delivery address
  - Order review
  - Payment
  - Order confirmation
- User profile and order history
- Admin dashboard
- Admin management for:
  - Products
  - Movies
  - Users
  - Orders
- Responsive React UI
- Redux Toolkit for application state management
- Axios API integration
- Toast notifications and UI animations

### Tech Stack

#### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit
- React Redux
- Tailwind CSS
- Axios
- Framer Motion
- React Hot Toast
- Lucide React
- React Icons
- JWT Decode
- Day.js

#### Backend

- Java 21
- Spring Boot 3.4.2
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- Lombok
- MySQL
- Spring Data Elasticsearch
- Elasticsearch
- OpenCSV
- Apache Commons CSV
- Maven
### Project Structure

```text
Major Project/
├── ShopFlix/
│   ├── public/
│   ├── src/
│   │   ├── Admin/
│   │   ├── Footer/
│   │   ├── OrderSection/
│   │   ├── component/
│   │   │   └── Context/
│   │   ├── redux/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── store.js
│   ├── package.json
│   └── vite.config.js
│
└── ShopFlixBackend/
    ├── src/
    │   ├── main/
    │   │   ├── java/com/ayush/ShopFlixBackend/
    │   │   │   ├── config/
    │   │   ├── controller/
    │   │   ├── entity/
    │   │   ├── model/
    │   │   ├── Repo/
    │   │   ├── security/
    │   │   └── services/
    │   │   └── resources/
    │   │       └── application.properties
    │   └── test/
    ├── pom.xml
    ├── mvnw
    └── mvnw.cmd
```
### Application Architecture

```text
                ┌─────────────────────┐
                │   React / Vite UI   │
                │                     │
                │ Redux + Router      │
                │ Axios API Client    │
                └──────────┬──────────┘
                           │
                           │ HTTP / JWT
                           ▼
                ┌─────────────────────┐
                │   Spring Boot API   │
                │                     │
                │ Controllers         │
                │ Services            │
                │ Spring Security     │
                │ JWT Authentication  │
                └───────┬───────┬─────┘
                        │       │
              ┌─────────┘       └──────────┐
              ▼                            ▼
      ┌───────────────┐            ┌───────────────┐
      │     MySQL     │            │ Elasticsearch │
      │               │            │               │
      │ Users         │            │ Product       │
      │ Products      │            │ Movie Search  │
      │ Orders        │            │               │
      │ Cart/Items    │            └───────────────┘
      └───────────────┘

```
### Authentication

ShopFlix uses **Spring Security with JWT authentication**.

### Login

```http
POST /auth/login
```
### Authentication

ShopFlix uses **Spring Security with JWT authentication**.

### Login

```http
POST /auth/login
```
### Signup

```http
POST /auth/signup
```
After login, the frontend stores the JWT token and attaches it to protected API requests using an Axios interceptor:
```http
Authorization: Bearer <JWT_TOKEN>
```
## API Overview

### Authentication

| Method | Endpoint       | Description         |
|--------|----------------|---------------------|
| POST   | `/auth/login`  | Authenticate a user |
| POST   | `/auth/signup` | Register a new user |

### Products & Movies
| Method | Endpoint | Description |
|---|---|---|
| GET | `/shopflix/movies` | Get paginated movies |
| GET | `/shopflix/electronics` | Get electronics |
| GET | `/shopflix/beautyandgroomings` | Get beauty & grooming products |
| GET | `/shopflix/womenscloth` | Get fashion products |
| GET | `/shopflix/kitchenstorage` | Get kitchen & storage products |
| GET | `/api/search` | Search products |
| GET | `/api/movies/search` | Search movies |
### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/{email}` | Get user profile |

### Cart & Watchlist

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user_items/add` | Add an item |
| GET | `/user_items/cart/count/{userId}` | Get cart item count |
| GET | `/user_items/cart/{userId}` | Get cart items |
| GET | `/user_items/cart/items/{userId}` | Get cart items grouped by section |
| GET | `/user_items/watchlater/items/{userId}` | Get watch-later items |
## Frontend Routes

Some of the main frontend routes include:

```text
/
├── /login
├── /signup
├── /shop
├── /search
├── /movies
├── /profile
├── /profile/orders
├── /watchlist
├── /category/electronics
├── /category/kitchenstorage
├── /category/beautyandgroomings
├── /category/fashion
│
├── /shop/:userId/cart
├── /shop/:userId/cart/address
├── /shop/:userId/cart/address/review
├── /shop/:userId/cart/address/review/payment/:addressId
├── /shop/:userId/thankyou
│
└── /admin
    ├── /admin/managemovies
    ├── /admin/manageorders
    ├── /admin/manageproducts
    └── /admin/manageusers

```
## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Java 21
- Maven
- MySQL
- Elasticsearch 7.x-compatible setup

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE ShopFlix;
```
Configure your database credentials in the backend configuration.
For security, do not commit real database passwords or JWT secrets to GitHub. Use environment variables or a local configuration file that is excluded from version control.
Example:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ShopFlix
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}

jwt.secret=${JWT_SECRET}

spring.elasticsearch.rest.uris=http://localhost:9200
```
### Elasticsearch Setup
The application uses Elasticsearch for product and movie search.
Make sure Elasticsearch is running locally:
```Plain text
http://localhost:9200
```
Verify the service with:
```bash
curl http://localhost:9200
```
### Running the Backend
Navigate to the backend directory:
```bash
cd ShopFlixBackend
```
Run the application using Maven:
```bash
./mvnw spring-boot:run
```
On Windows:
```bash
mvnw.cmd spring-boot:run
```
The backend runs on:
```Plain text
http://localhost:8080
```
### Running the Frontend
Open a new terminal and navigate to the frontend:
```bash
cd ShopFlix
```
Install dependencies:
```bash
npm install
```
Start the development server:
```bash
npm run dev
```
The Vite development server normally runs at:
```Plain text
http://localhost:5173
```
### Production Build
Create a frontend production build:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```
Run the frontend linter:
```bash
npm run lint
```
### Security Notes
Before publishing this repository publicly:
1. Remove database passwords from application.properties.
2. Store JWT_SECRET outside the repository.
3. Add sensitive configuration files to .gitignore.
4. Rotate any credentials that have already been exposed.
5. Never commit API keys, database credentials, private certificates, or production secrets.
Future Improvements
Possible improvements for the project include:
- Add a dedicated payment gateway integration
- Add refresh-token based authentication
- Improve role-based access control for admin APIs
- Add automated backend and frontend tests
- Add Docker and Docker Compose configuration
- Add CI/CD with GitHub Actions
- Add API documentation using Swagger/OpenAPI
- Improve centralized exception handling
- Add product image storage using cloud storage
- Add order tracking and notifications
- Add production Elasticsearch configuration
## License

This project is intended for educational and portfolio purposes.

Built with **React, Spring Boot, MySQL, Elasticsearch, and JWT**.