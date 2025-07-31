# Tech Context: Personal E-Commerce Application

This document provides an overview of the technologies, development setup, and technical constraints for the e-commerce application.

## 1. Technologies Used

### Frontend
- **Framework:** Angular (v19/20)
- **UI Components:** Angular Material (MDC)
- **Authentication Library:** MSAL.js (Microsoft Authentication Library for JavaScript)

### Backend
- **Framework:** .NET 9 Web API
- **API Gateway:** Ocelot
- **Event Bus:** RabbitMQ

### Databases & Caching
- **Primary Database:** PostgreSQL (hosted on Supabase)
- **Caching:** Redis (for basket/cart)

### Authentication
- **Provider:** Microsoft Entra External ID
- **User Flows:** Standard user flows for sign-up, sign-in, etc.

### DevOps & Deployment
- **Containerization:** Docker
- **Orchestration & CI/CD:** Kubernetes
- **Frontend Hosting:** Firebase Hosting


## 2. Development Setup

- **IDE:** Visual Studio Code is the primary editor.
- **Source Control:** Git, with a polyrepo structure (one repository per microservice).
- **Local Environment:** Docker Desktop will be used to run the microservices, RabbitMQ, Redis, and a local PostgreSQL instance for development and testing.


### Sass Structure (7-1 Pattern)
- The project uses the 7-1 SASS architecture for scalable, maintainable styles.
- Each folder (`abstracts`, `base`, `layout`, `components`, `themes`, `vendors-extensions`) contains an `_index.scss` that forwards all partials in that folder.
- The main entry point, `main.scss`, imports only the index files, keeping imports clean and modular.
- Import order in `main.scss`: abstracts → base → layout → components → vendors → themes.
- All base styles are imported via `base/_index.scss`.
- Abstracts, components, layout, and vendor extensions are imported via their respective index files.
- Vendor and component overrides for Angular Material should be placed in `vendors-extensions/` and `components/` respectively.

## 3. Technical Constraints & Considerations

- **.NET Version:** The project is standardized on .NET 9. All backend services must use this version to ensure consistency.
- **Angular Version:** The frontend will use a recent version of Angular (19/20) to leverage the latest features and performance improvements.
- **Stateless Services:** Backend services should be designed to be stateless wherever possible to facilitate horizontal scaling. State, when required (like the user's basket), will be managed in an external store like Redis.
- **JWT Validation:** Each microservice must be configured to validate JWTs issued by Microsoft Entra External ID. This will involve fetching the public keys from the tenant's metadata endpoint and validating the token's signature, issuer, and audience.
- **Polyrepo Management:** While a polyrepo structure offers independence, it also introduces challenges in managing dependencies and ensuring consistent configurations across services. A clear strategy for versioning and shared libraries will be needed.
