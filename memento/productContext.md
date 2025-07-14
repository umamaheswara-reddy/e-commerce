# Product Context: Personal E-Commerce Application

This document details the product vision, the problems it aims to solve, and the desired user experience for the personal e-commerce application.

## 1. Why This Project Exists

The primary motivation for this project is educational. It serves as a practical, hands-on exercise to build and deploy a complex, full-stack application using modern, cloud-native technologies and architectural patterns. The goal is to gain deep, practical experience in the entire development lifecycle, from conception to deployment and maintenance.

## 2. Problems It Solves

From a user's perspective, it will solve the standard problems of an e-commerce site:
- Discovering and browsing products.
- Adding products to a shopping cart.
- A seamless and secure checkout process.
- Viewing order history.

From a developer's perspective, it addresses the challenge of:
- Integrating multiple, independent microservices.
- Implementing a secure and robust authentication system with a third-party provider.
- Managing asynchronous communication between services.
- Setting up a full CI/CD pipeline for a containerized application.
- Gaining experience with a polyrepo structure.

## 3. How It Should Work

The application should function as a standard e-commerce platform.
- **Users:** Can register and log in via Azure AD B2C. Once authenticated, they can browse the product catalog, manage their shopping cart, place orders, and view their order history.
- **System:** The frontend Angular application will communicate with the backend microservices through an Ocelot API Gateway. The gateway will route requests to the appropriate service (Catalog, Basket, Orders, etc.). The services will be independent and communicate with each other via RabbitMQ for events like order creation.

## 4. User Experience Goals

- **Modern & Responsive:** The user interface, built with Angular Material, should be modern, intuitive, and fully responsive, providing a seamless experience on both desktop and mobile devices.
- **Fast & Performant:** The application should be fast and responsive. Caching strategies (e.g., Redis for the basket) will be employed to ensure low latency for critical operations.
- **Secure:** User data and authentication will be handled securely through Azure AD B2C. The user should feel confident that their information is protected.
