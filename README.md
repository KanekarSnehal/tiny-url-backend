
# Tiny Url

Tiny Url is a simple and efficient solution for shortening URLs, generating QR codes, and customizing shortened links. With this tool, users can quickly convert long, cumbersome URLs into concise and shareable links, making it easier to distribute and manage web addresses.

## Tech Stack

**Frontend:** Vue.js, VeeValidate, Vue Router, Vue Chart.js, Pinia

**Backend:** Nest.js, Zod, JWT

**ORM:** TypeORM

**Database:** MySQL, Redis
## How to run the app locally?

### Using npm
```bash
$ git clone https://github.com/KanekarSnehal/tiny-url-backend.git
$ cd tiny-url-backend
$ npm install
$ npm start
```

### Using Docker
- To run the application using Docker, you can pull the Docker image from Docker Hub:
```bash
$ docker pull backenddev99/tinyurl-backend:1.0.0
```
- Run the Docker container:
```bash
$ docker run -d -p 3000:3000 backenddev99/tinyurl-backend:1.0.0
```
This will start the Tiny URL backend server in a Docker container, accessible at http://localhost:3000

### Using Docker Compose
Alternatively, you can use Docker Compose for managing multi-container Docker applications. A `docker-compose.yaml` file is provided in the repository. 

To use it:
- Make sure you have Docker Compose installed on your system.
- Clone the repository:
```bash
$ git clone https://github.com/KanekarSnehal/tiny-url-backend.git
$ cd tiny-url-backend
```
- Run the Docker Compose command:
```bash
$ docker-compose up
```
- This will start the application along with any necessary services (such as MySQL and Redis), as defined in the `docker-compose.yaml` file.

## Technical Documentation

### Functional Requirements
- Given a URL, our service should generate a shorter and unique alias for it.
- Users should be redirected to the original URL when they visit the short link.
- Users should be able to customise the back half.
- QR code generator. Scanning the barcode will send a user to a specific URL selected by the maker of the QR code.
- Record analytics and metrics for redirections.


### Strategy for Shortening of URL
Our strategy for shortening URLs revolves around creating a unique hash that ensures the uniqueness of each shortened URL while also maintaining a user-friendly length.

To achieve this, we first generate a unique string by concatenating the user's `IP address` with the `current timestamp`. This string serves as the basis for our hash generation process. This uniqueness minimizes the possibility of collisions when generating shortened URLs.

We then apply the `CRC32 hashing algorithm` to this string, producing a hash value that encapsulates the uniqueness of the input data. CRC32 is a widely-used hashing algorithm known for its efficiency and relatively low collision rate. This hash serves as the basis for creating a shortened URL.

Finally, to ensure that the resulting URL is concise and user-friendly, we convert the CRC32 hash from `hexadecimal to Base62 representation`. Base62 encoding utilizes a character set of alphanumeric characters (0-9, a-z, A-Z), resulting in shorter URLs compared to hexadecimal or decimal representations. This conversion further enhances the uniqueness and readability of our shortened URLs.

By combining these techniques, we create shortened URLs that are both unique and compact, optimizing user experience while maintaining data integrity.

### Security Mechanism

**Authentication and Authorization**

**JWT Token Usage:**

During the login process, a JWT (JSON Web Token) is generated on the server-side and sent to the frontend.
This JWT token is stored securely in the local storage of the frontend application.

**Bearer Token in Requests:**

For every subsequent request to the backend, the JWT token is included in the request header as a Bearer token.
This ensures that only authenticated users with a valid token can access protected resources.

**Backend Authentication Guard:**

Upon receiving a request, the backend employs an authentication guard.
This guard extracts the JWT token from the authorization header and decodes it using JWT decoding techniques.
If the token is valid and not expired, access to the requested resource is granted.

**Logout Mechanism**

**Token Blacklisting:**

When a user logs out, an API call is made from the frontend to the backend.
The backend receives the JWT token from the request headers.
Instead of immediately invalidating the token, token is stored only if it's not expired in a Redis database with expiry set to current token validity.

**Redis Storage:**

The Redis database only stores tokens of logged-out users.
By storing only logged-out tokens, even if an attacker gains access to the Redis database, they cannot misuse the tokens as they are already expired. Tokens are flagged to reject requests bearing that token.

**Token Validation During Requests:**

When a request is made with a JWT token, the backend authentication guard first checks if the token exists in the Redis database.
If the token is found in the Redis database, it is considered invalid, and further access is denied.

**Expiry Management**

The tokens stored in Redis have the same expiry as the JWT tokens.
This ensures consistency in token expiration and enhances security by reducing the window of vulnerability.

By combining JWT tokens with Redis-based blacklisting, the system ensures both authentication and authorization integrity.

### Analytics
**Tracking Mechanism:**
Every time a URL is visited or a QR code is scanned, analytics data is collected to understand user behavior and usage patterns.
This data includes information about the user's geographical location, device details, and operating system.

**Geolocation Tracking:**
The IP address of the user is captured and passed to a GeoPlugin provider to obtain the user's city and country information.
This helps in understanding the geographical distribution of users accessing the URLs or scanning QR codes.

**Device Detection:**
The user-agent header from the request is extracted and passed to a device detection npm package.
This package helps in identifying the user's operating system, client, and device details.
By analyzing this data, insights into the types of devices and operating systems used by the users can be gained.

### Libraries Used
**NestJS:** A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

**Zod:** A TypeScript-first schema declaration and validation library.

**TypeORM:** A widely adopted Object-Relational Mapping (ORM) library for TypeScript and JavaScript.

**QR Code Generation Library:** [qrcode](https://www.npmjs.com/package/qrcode) - This library is used to generate QR codes for our shortened URLs.

**Device-detector-js:** [device-detector-js](https://www.npmjs.com/package/device-detector-js) - Device-detector-js is a precise user agent parser and device detector written in TypeScript, backed by the largest and most up-to-date open-source user agent database.

**Redis:** - This library is used for implementing caching.

**JWT (JSON Web Tokens):** [jwt](https://jwt.io/) - JWTs are used for authentication within our system.

### Database Schema
For the database schema, please refer to the attached Entity-Relationship (ER) diagram. This diagram illustrates the structure of our database, including the relationships between different entities and their attributes.
[ER diagram](https://dbdiagram.io/d/Bitly-65b53901ac844320aed970bf)


### OpenAPI Specification
While NestJS inherently supports the generation of OpenAPI specifications, we have manually crafted our specification to deepen our understanding of OpenAPI standards and tailor it to our specific requirements.
[OpenAPI Specification](https://github.com/KanekarSnehal/tiny-url-backend/blob/main/openapi.yaml)
## Related

Here is the link to frontend repo.

[tiny-url-frontend](https://github.com/KanekarSnehal/tiny-url-frontend)
