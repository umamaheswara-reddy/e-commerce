# Progress: Personal E-Commerce Application

This document tracks the development progress of the e-commerce application.

## 1. What Works

- **Project Documentation:** The initial Memento documentation is in place. This provides a clear and comprehensive overview of the project's goals, architecture, and technical stack.

## 2. What's Left to Build

Everything. The project is currently in the planning and documentation phase. The following major components need to be built:

### Frontend (Angular)
- Scaffolding of the Angular application.
- Integration with Angular Material.
- Implementation of MSAL for Azure AD B2C authentication.
- Core components (product list, product details, cart, checkout, order history).
- Routing and navigation.

### Backend (.NET)
- Scaffolding for each microservice:
  - Catalog
  - Basket
  - Orders
  - Payment
- Database setup and migrations for each service.
- Implementation of business logic and API endpoints.
- Integration with RabbitMQ for event-driven communication.
- JWT validation for Azure AD B2C.
- Ocelot API Gateway configuration.

### DevOps
- Dockerfiles for each microservice.
- Docker Compose for the local development environment.
- Kubernetes manifests for deployment.
- CI/CD pipelines.

## 3. Current Status

- **Phase:** 1 - Project Setup and Documentation.
- **Status:** In Progress. The core Memento files have been created.

## 4. Known Issues

- None at this time.
