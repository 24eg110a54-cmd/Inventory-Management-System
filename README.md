# 🏪 Small Shop Inventory Management System

A full-stack, production-ready web application designed for a small shop owner to keep track of products, prices, and available stock, and easily identify items that need restocking.

---

## 📌 Problem Statement & Features Overview

| Feature Requirement | Status | Implementation Details |
| :--- | :---: | :--- |
| **Add a product** | ✅ Done | Unique Product ID (e.g. `PRD-101`), Name, Price, and Quantity in stock. Enforces uniqueness and non-negative values. |
| **Display all products** | ✅ Done | Interactive table showing Product IDs, Names, Categories, Prices, Stock counts, and formatted Currency. |
| **Update product price or stock** | ✅ Done | Full edit modal for price and product details, plus one-click **+ / -** quick stock adjustment steppers. |
| **Search products** | ✅ Done | Real-time live search across both **Product Name** and **Product ID** with instant filtering. |
| **Low-stock warning (< 5 units)** | ✅ Done | Prominent warning banners, pulsing amber/red status badges (`⚠️ Low Stock: X left`), dedicated filter pill, and summary counters. |

---

## 🛠️ Technology Stack

- **Frontend**: [React.js](https://react.dev/) (Vite, modern hooks, responsive CSS UI, [Lucide Icons](https://lucide.dev/))
- **Backend**: [Java 17](https://adoptium.net/) + [Spring Boot 3.3.4](https://spring.io/projects/spring-boot) REST API
- **ORM & Data Layer**: Spring Data JPA & Hibernate
- **Database**:
  - **Local Development**: ANSI SQL H2 File Database (persisted locally at `./data/inventorydb.mv.db`, no external SQL server installation needed) + Web SQL console.
  - **Production / Render**: PostgreSQL database (automatically connected via `DATABASE_URL` / `SPRING_DATASOURCE_URL`).
- **Deployment**:
  - **Backend**: Multi-stage [Docker](https://www.docker.com/) container deployed to [Render](https://render.com/).
  - **Frontend**: Single Page Application (SPA) deployed to [Vercel](https://vercel.com/) with `vercel.json` rewrites.

---

## 📂 Project Structure

```text
Inventory Management System/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/inventory/
│   │   │   │   ├── config/             # CORS, Database HikariCP & Seed Data
│   │   │   │   ├── controller/         # REST API endpoints (/api/products)
│   │   │   │   ├── dto/                # Request & Response Data Transfer Objects
│   │   │   │   ├── exception/          # Global Exception Handler & Custom Errors
│   │   │   │   ├── model/              # Product JPA Entity with constraints
│   │   │   │   ├── repository/         # Spring Data JPA Repository & Custom Queries
│   │   │   │   ├── service/            # Business logic & low-stock detection (< 5)
│   │   │   │   └── InventoryApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── schema.sql          # Standard SQL DDL Schema (PostgreSQL/H2/MySQL)
│   │   └── test/                       # Unit and integration test suite
│   ├── Dockerfile                      # Multi-stage production container build
│   ├── pom.xml                         # Maven project configuration
│   └── render.yaml                     # Render Blueprint specification
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── LowStockBanner.jsx      # Warning banner for items < 5
│   │   │   ├── NotificationToast.jsx
│   │   │   ├── ProductModal.jsx        # Add / Edit product dialog
│   │   │   ├── ProductTable.jsx        # Inventory table with warning badges
│   │   │   ├── SearchBar.jsx           # Search input, filter pills & sorting
│   │   │   └── StatsCards.jsx          # Inventory overview metrics
│   │   ├── services/
│   │   │   └── api.js                  # Centralized REST API client
│   │   ├── App.jsx
│   │   ├── index.css                   # Custom responsive styling
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vercel.json                     # Vercel SPA routing configuration
│   └── vite.config.js
│
├── render.yaml                         # Root Render Blueprint file
└── README.md
```

---

## ⚡ Quick Start (Running Locally)

### Prerequisites
- **Java 17+** (`java -version`)
- **Maven 3.8+** (`mvn -v`)
- **Node.js 18+** & **npm** (`node -v`, `npm -v`)

### 1. Start the Spring Boot Backend
Open a terminal in the `backend` folder:
```powershell
cd backend
mvn spring-boot:run
```
- The backend will start on **`http://localhost:8081`** (or 8080 if not occupied).
- Pre-seeded products (including low-stock warnings) will automatically load.
- **SQL Database Web Console**: Visit **`http://localhost:8081/h2-console`**
  - **JDBC URL**: `jdbc:h2:file:./data/inventorydb`
  - **User**: `sa`
  - **Password**: *(leave blank)*

### 2. Start the React Frontend
Open a new terminal in the `frontend` folder:
```powershell
cd frontend
npm install
npm run dev
```
- The frontend will open at **`http://localhost:5173`**.
- It communicates directly with `http://localhost:8081/api`.

---

## 🗄️ SQL Database Details

1. **Local Persistent Storage**:
   - The application automatically uses a file-based ANSI SQL database in `./data/inventorydb.mv.db`.
   - All transactions, products, stock counts, and constraints persist across application restarts.
2. **SQL Schema (`schema.sql`)**:
   ```sql
   CREATE TABLE IF NOT EXISTS products (
       id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
       product_id VARCHAR(100) NOT NULL UNIQUE,
       name VARCHAR(255) NOT NULL,
       category VARCHAR(100),
       price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
       quantity INT NOT NULL CHECK (quantity >= 0),
       description TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE INDEX idx_products_product_id ON products(product_id);
   CREATE INDEX idx_products_name ON products(name);
   CREATE INDEX idx_products_quantity ON products(quantity);
   ```

---

## 🚀 Deployment Guide

### A. Deploy Backend to Render (Docker)

The repository includes a production-ready **`backend/Dockerfile`** with a multi-stage build:

#### Option 1: Render 1-Click Blueprint (Recommended)
1. Push this repository to **GitHub** or **GitLab**.
2. Go to your [Render Dashboard](https://dashboard.render.com/).
3. Click **"New"** > **"Blueprint"**.
4. Select your repository. Render will automatically read `render.yaml` and configure:
   - A free **PostgreSQL Database** (`inventory-db`).
   - A **Web Service** running the Dockerfile with automatic environment variables (`PORT`, `DATABASE_URL`).
5. Click **Apply**. Once built, copy your Render web service URL (e.g. `https://inventory-backend.onrender.com`).

#### Option 2: Manual Web Service on Render
1. Click **"New"** > **"Web Service"** in Render.
2. Connect your Git repository.
3. Select **Docker** as the Runtime:
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile`
4. Under **Environment Variables**, set:
   - `PORT`: `8080`
   - `SPRING_DATASOURCE_URL`: your PostgreSQL connection string (or create a Render free PostgreSQL database and link `DATABASE_URL`).
   - `CORS_ALLOWED_ORIGINS`: `https://*.vercel.app,http://localhost:5173`
5. Click **Create Web Service**.

---

### B. Deploy Frontend to Vercel

The frontend includes **`vercel.json`** for clean client-side SPA routing:

1. Push your repository to **GitHub** or **GitLab**.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **"Add New..."** > **"Project"** and import your repository.
4. In the project setup:
   - **Framework Preset**: Vite
   - **Root Directory**: Click "Edit" and choose `frontend`
5. Under **Environment Variables**, add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your live Render backend API URL (e.g., `https://inventory-backend.onrender.com/api`)
6. Click **Deploy**. Vercel will build and launch your application globally!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve all products (Supports `?search=...` and `?lowStock=true`) |
| `GET` | `/api/products/{id}` | Get product details by internal primary key ID |
| `GET` | `/api/products/by-product-id/{productId}` | Get product details by unique product ID (e.g. `PRD-101`) |
| `POST` | `/api/products` | Add a new product (validates uniqueness of `productId`, `price >= 0`, `quantity >= 0`) |
| `PUT` | `/api/products/{id}` | Update product details, price, or stock |
| `PATCH` | `/api/products/{id}/stock` | Quick update of stock quantity (`{"quantity": 10}`) |
| `DELETE` | `/api/products/{id}` | Permanently remove a product from inventory |
| `GET` | `/api/products/low-stock` | Retrieve all items with stock strictly below 5 (`quantity < 5`) |
| `GET` | `/api/products/stats` | Retrieve shop inventory summary metrics |

---

## 🧪 Running Automated Tests

Run the backend unit and integration test suite:
```powershell
cd backend
mvn test
```
**Test Coverage Includes:**
- Product creation and retrieval
- Unique Product ID constraint enforcement (rejects duplicates with HTTP 409)
- Non-negative validation for price and stock quantity (HTTP 400)
- Low-stock indicator logic (`quantity < 5` flags `isLowStock() = true`)
- Name and Product ID search accuracy
- Stock adjustment and price update workflows
