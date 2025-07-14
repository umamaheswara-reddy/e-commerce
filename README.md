# Personal E-Commerce Application

This repository contains the full-stack e-commerce application being built to deepen practical understanding of modern web and cloud-native architecture.

## Project Overview

This project is a comprehensive e-commerce platform featuring a modern frontend, a microservices-based backend, and a complete cloud deployment pipeline. It is designed to serve as a practical, hands-on learning experience.

For a complete and detailed understanding of the project's architecture, goals, and current progress, please refer to the `memento/` directory. The Memento is the single source of truth for this project.

## Technical Stack

- **Frontend:** Angular (19/20) with Angular Material (MDC components)
- **Backend:** .NET 9 Web API Microservices
- **Authentication:** Azure AD B2C
- **API Gateway:** Ocelot
- **Event Bus:** RabbitMQ
- **Database:** PostgreSQL on Supabase
- **Caching:** Redis
- **Deployment:** Docker, Kubernetes, Firebase Hosting

## Architecture

The system is designed with a polyrepo, microservices architecture. Key principles include Domain-Driven Design, Separation of Concerns, and designing for scalability.

Key services include:
- **Catalog**
- **Basket**
- **Orders**
- **Payment**

For a visual representation and more detailed breakdown, see `memento/systemPatterns.md`.

## Getting Started

Further instructions on setting up the local development environment and running the application will be added here as the project progresses.
