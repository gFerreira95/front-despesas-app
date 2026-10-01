# Personal Finance Management System

A production-ready, full-stack web application built to demonstrate clean architecture, scalable infrastructure, and modern security practices.

**Live Demo:** [https://front-despesas-app.vercel.app/login] (login - user/ password - user)
**API Endpoint:** [https://controle-despesas-api.onrender.com/]

## Architecture Overview

The system is built with a strict Separation of Concerns, decoupling the client and server into independent repositories. This architectural decision enables independent scaling, distinct CI/CD pipelines, and technology-agnostic maintenance.

*   **Front-end Repository:** [https://github.com/gFerreira95/front-despesas-app]
*   **Back-end Repository:** [https://github.com/gFerreira95/controle-despesas-api]

### Tech Stack
*   **Front-end:** Angular 17+ (Standalone Components), RxJS, Reactive Forms, SCSS.
*   **Back-end:** Java 21, Spring Boot 3, Spring Security, Maven.
*   **Database:** MongoDB Atlas (NoSQL).
*   **Deployment:** Vercel (Front-end CDN) & Render (Dockerized Java environment).

---

## Security & Best Practices

Security is implemented in accordance with the Twelve-Factor App methodology:

*   **Stateless Authentication:** Utilizes JSON Web Tokens (JWT) for stateless session management, allowing the API to scale horizontally without memory overhead.
*   **Zero-Trust Secrets:** Database URIs (`MONGO_URI`) and JWT Secret Keys are injected exclusively via Environment Variables in the production container. No sensitive data is hardcoded.
*   **Strict CORS Policy:** Wildcard origins (`*`) are disabled for credentialed requests. The API explicitly whitelists the Vercel production domain at the centralized `WebMvcConfigurer` level, mitigating Cross-Site Request Forgery (CSRF).
*   **Data Integrity & Hashing:** Passwords are cryptographically hashed using BCrypt before database persistence. Incoming payloads are sanitized and validated using Spring Boot Validation annotations (`@NotBlank`, `@Positive`).

---

## Engineering Decisions

### Back-end (Layered Architecture)
The REST API strictly follows SOLID principles and Clean Architecture:
*   Controllers handle HTTP routing exclusively.
*   Services encapsulate pure business logic.
*   Repositories manage MongoDB interactions via Spring Data JPA.
*   **Containerization:** The application is deployed using a multi-stage `Dockerfile`, utilizing the `eclipse-temurin:21-jre` image for a lightweight, production-optimized runtime environment.

### Front-end (Smart/Dumb Component Pattern)
The Angular application utilizes the Smart and Presentational (Dumb) Component Pattern:
*   **Smart Components:** Components like the Dashboard handle state management and HTTP Service injections.
*   **Presentational Components:** UI elements like Tables and Forms rely purely on `@Input()` and `@Output()` decorators, maximizing reusability and simplifying unit testing.
*   **Reactive UI:** `BehaviorSubject` is utilized for real-time, non-blocking state updates (such as Toast notifications) without requiring page reloads.

---

## How to Run Locally

### Prerequisites
*   Node.js (v18 or higher)
*   Java Development Kit (JDK 21)
*   Maven
*   Git

### Local Setup

1. Clone both repositories:
   ```bash
   git clone [https://github.com/gFerreira95/front-despesas-app]
   git clone [bhttps://github.com/gFerreira95/controle-despesas-api]

    Back-end Configuration:
    Navigate to the back-end root directory and set the required environment variables.
    Bash

    export MONGO_URI="your_mongodb_cluster_string"
    export JWT_SECRET="your_local_secret_key"
    mvn spring-boot:run

    Front-end Configuration:
    Navigate to the front-end root directory, install dependencies, and start the development server.
    Bash

    npm install
    ng serve

    Access the application locally at http://localhost:4200.

Developed by [Gilson Ferreira] - LinkedIn:  https://www.linkedin.com/in/gilson-junior-126876185/