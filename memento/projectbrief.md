# Project Brief: Personal E-Commerce Application

This document outlines the core requirements and goals for a personal full-stack e-commerce application. The project is intended to deepen practical understanding of modern web and cloud-native architecture.

## 1. Project Scope

The project is a full-stack e-commerce application featuring a frontend, a microservices-based backend, and a complete cloud deployment pipeline.

## 2. Technical Stack

- **Frontend:** Angular (19/20) with Angular Material (MDC components).
- **Backend:** .NET 9 Web API, structured as microservices.
- **Authentication:** Microsoft Entra External ID. Frontend interaction via MSAL.
- **API Gateway:** Ocelot.
- **Event-Driven Communication:** RabbitMQ.
- **Database:** PostgreSQL on Supabase.
- **Caching:** Redis for cart data.
- **Containerization:** Docker.
- **Deployment:**
  - **Frontend:** Firebase Hosting.
  - **Backend:** Docker containers.
- **CI/CD:** Kubernetes.

## 3. Architecture

- **Structure:** Polyrepo.
- **Backend Architecture:** Microservices.
  - Identity (handled by Microsoft Entra External ID)
  - Catalog
  - Basket
  - Orders
  - Payment
- **Design Principles:**
  - Separation of Concerns
  - Domain-Driven Design (DDD)
  - Scalability

## 4. Key Architectural Intentions

- **Authentication:** The Identity microservice is replaced by Microsoft Entra External ID's hosted flows. All other microservices will validate JWTs issued by Entra External ID.
- **Event-Driven:** Microservices will communicate asynchronously via RabbitMQ to ensure loose coupling and scalability.
- **Containerization:** All services will be containerized with Docker for consistency across development, testing, and production environments.
- **Cloud-Native:** The application will be deployed to a combination of cloud services (Firebase, Supabase) and orchestrated with Kubernetes, reflecting modern cloud-native patterns.
