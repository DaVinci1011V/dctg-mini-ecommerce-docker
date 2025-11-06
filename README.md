# **🛍️ Mini E-Commerce Product Listing (Full-Stack Project)**

A fully Dockerized mini e-commerce product listing module built with Node.js (Express), SQLite, and a clean HTML \+ JS frontend, developed as part of Dream Come True Group’s Technical Project Manager assessment.

---

## **📸 Screenshots**

### **🖥️ Web Interface ([http://localhost:4000](http://localhost:4000))**

### **📘 API Documentation ([http://localhost:4000/docs](http://localhost:4000/docs))**

---

## **🚀 Quick Start with Docker**

### **Prerequisites**

* Docker Desktop or Docker Engine installed

* Node not required locally (built inside container)

### **Run the application**

docker compose up \--build

When finished building:

| Service | URL | Description |
| ----- | ----- | ----- |
| Frontend | http://localhost:4000 | Interactive UI for listing and adding products |
| Swagger Docs | http://localhost:4000/docs | Auto-generated API reference |
| Health Check | http://localhost:4000/health | Returns { ok: true } |

---

## **🧱 Project Structure (Actual)**

DCTG-MINI-ECOMMERCE-DOCKER-FINAL/

│

├── backend/

│   ├── data.db

│   ├── Dockerfile

│   ├── openapi.yaml

│   ├── package.json

│   ├── package-lock.json

│   ├── server.js

│   └── .env.example

│

├── frontend/

│   ├── index.html

│   ├── style.css

│   └── app.js

│

├── docker-compose.yml

├── openapi.yaml

├── postman\_collection.json

└── README.md

---

## **🧰 Tech Stack Justification**

| Layer | Technology | Rationale |
| ----- | ----- | ----- |
| Frontend | HTML5, CSS3, Vanilla JS | Zero build complexity, served directly by Express |
| Backend | Node.js \+ Express | Lightweight, REST-oriented framework |
| Database | SQLite3 | Simple file-based SQL for local testing |
| Auth | JWT | Stateless and production-ready |
| Docs | Swagger UI (OpenAPI 3.0) | Auto-generated API interface |
| Containerization | Docker \+ Compose | Single-command build and run |

---

## **🧠 Architecture Overview**

Frontend (HTML \+ JS)

        ↓

Express Server (Node.js)

        ↓

SQLite Database (file: data.db)

* The Express server serves both static files and API routes.

* JWT protects the POST /products endpoint.

* Database is auto-created and seeded on startup.

* Swagger is available for API testing.

---

## **👥 3-Developer Task Breakdown**

| Role | Responsibility | Effort |
| ----- | ----- | ----- |
| Frontend Dev | Build UI (list, filters, form) | 1.5 days |
| Backend Dev | APIs, DB schema, JWT auth | 2 days |
| DevOps Eng | Docker, Swagger, Docs | 1 day |
| QA/Test | Validation & UX review | 0.5 day |

## ---

## **☁️ AWS Deployment Plan**

| Component | Service | Purpose |
| ----- | ----- | ----- |
| Backend API | EC2 (Docker) | Host Express API behind ALB |
| Frontend | S3 \+ CloudFront | Serve static files globally |
| Database | RDS (PostgreSQL) | Replace SQLite with managed SQL |
| Secrets | SSM Parameter Store | JWT keys \+ credentials |
| Logging | CloudWatch | Collect and analyze logs |
| CI/CD | GitHub Actions → ECR/ECS | Continuous deployment |

Estimated cost: \~$10/month for demo scale.

---

## **🔒 Authentication Flow**

1. Admin login request:

POST /login

{ "username": "admin", "password": "admin123" }

→ returns JWT token.

2\. Include token in Authorization: Bearer \<token\> for POST /products.

3\. UI handles login/logout state via token variable.

---

## **💡 Future Enhancements**

* Replace SQLite → PostgreSQL with Sequelize ORM.

* Add image upload (S3 integration).

* Sorting, search and edit/delete products.

* Unit & E2E tests (Jest/Cypress).

* Role-based auth and refresh tokens.

---

## **🧾 Sample API Responses**

### **GET /products**

{

  "data": \[

    { "id":1,"name":"USB-C Cable","price":29.9,"category":"Accessories","inStock":1,"createdAt":"2025-11-06T08:30:00Z" }

  \],

  "page":1,"limit":10,"total":4

}

### **POST /products**

{

  "id":5,

  "name":"Smart Watch",

  "price":299.99,

  "category":"Electronics",

  "inStock":1,

  "createdAt":"2025-11-06T09:10:00Z"

}

---

## **🙋‍♂️ About This Build**

Built by Mohamed Fahmi, Project Manager & Full-Stack Developer based in Dubai, UAE.  
I focused on clarity, maintainability, and team collaboration in this implementation — reflecting my real-world delivery standards.

📧 Email: mohamed.fahmi@email.com  
🔗 LinkedIn: linkedin.com/in/mohamedfahmi