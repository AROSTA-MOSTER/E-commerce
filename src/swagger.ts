import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce & Auth API Documentation",
      version: "1.0.0",
      description:
        "Comprehensive API documentation for E-Commerce store, Authentication, Password Reset with Nodemailer, and User Management.",
    },
    servers: [
      {
        url: "/",
        description: "Current Server",
      },
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from login/register",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "6ac509792e8ff710ddc1674c" },
            name: { type: "string", example: "Faustin N" },
            email: { type: "string", format: "email", example: "user@example.com" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
          },
        },
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Faustin N" },
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", minLength: 6, example: "password123" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        ForgotPasswordInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
          },
        },
        ResetPasswordInput: {
          type: "object",
          required: ["email", "code", "newPassword"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            code: { type: "string", minLength: 6, maxLength: 6, example: "123456" },
            newPassword: { type: "string", minLength: 6, example: "newpassword123" },
          },
        },
        ContactEmailInput: {
          type: "object",
          required: ["name", "email", "subject", "message"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            subject: { type: "string", example: "Question about shipping" },
            message: { type: "string", example: "When will my item arrive?" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", example: "670183e29f8f411b0e41712a" },
            name: { type: "string", example: "Wireless Headphones" },
            description: { type: "string", example: "Noise cancelling Bluetooth headphones" },
            category: { type: "string", example: "Electronics" },
            price: { type: "number", example: 99.99 },
            imageUrl: { type: "string", example: "https://res.cloudinary.com/..." },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new user",
          description: "Creates a new user, hashes password, sends a welcome email, and returns JWT token.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterInput" },
              },
            },
          },
          responses: {
            201: { description: "User registered successfully, welcome email sent" },
            400: { description: "Validation error" },
            409: { description: "Email already in use" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Log in with email and password",
          description: "Verifies user credentials and returns a JWT Bearer token.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginInput" },
              },
            },
          },
          responses: {
            200: { description: "Login successful with token" },
            401: { description: "Invalid email or password" },
            429: { description: "Too many login attempts" },
          },
        },
      },
      "/api/auth/profile": {
        get: {
          tags: ["Authentication"],
          summary: "Get current user profile",
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "Current user profile" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/auth/forgot-password": {
        post: {
          tags: ["Authentication"],
          summary: "Request a password reset code",
          description: "Sends a 6-digit OTP code to user's email expiring in 10 minutes.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ForgotPasswordInput" },
              },
            },
          },
          responses: {
            200: { description: "Reset code sent if email exists" },
          },
        },
      },
      "/api/auth/reset-password": {
        post: {
          tags: ["Authentication"],
          summary: "Reset password with OTP code",
          description: "Verifies 6-digit OTP code and updates password.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResetPasswordInput" },
              },
            },
          },
          responses: {
            200: { description: "Password reset successfully" },
            400: { description: "Invalid or expired code" },
          },
        },
      },
      "/api/users": {
        get: {
          tags: ["Users (Admin)"],
          summary: "Get all registered users (Admin only)",
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "List of users" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden - Admin role required" },
          },
        },
      },
      "/api/email/send": {
        post: {
          tags: ["Email"],
          summary: "Send a contact form inquiry",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ContactEmailInput" },
              },
            },
          },
          responses: {
            200: { description: "Message sent successfully" },
            400: { description: "Validation error" },
          },
        },
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "Get all inventory products",
          responses: {
            200: { description: "List of products" },
          },
        },
        post: {
          tags: ["Products"],
          summary: "Create a new product with image upload",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["name", "description", "category", "price", "image"],
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string" },
                    price: { type: "number" },
                    image: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Product created" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get product by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Product details" },
            404: { description: "Product not found" },
          },
        },
        put: {
          tags: ["Products"],
          summary: "Update an existing product",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          responses: {
            200: { description: "Product updated" },
            401: { description: "Unauthorized" },
          },
        },
        delete: {
          tags: ["Products"],
          summary: "Delete a product by ID",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Product deleted" },
            401: { description: "Unauthorized" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
