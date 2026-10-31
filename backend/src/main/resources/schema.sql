-- ============================================================
-- Inventory Management System - SQL Schema
-- Compatible with: TiDB, MySQL 8+, H2
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL UNIQUE,
    name       VARCHAR(255) NOT NULL,
    category   VARCHAR(100),
    price      DECIMAL(12, 2) NOT NULL,
    quantity   INT          NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_price    CHECK (price >= 0),
    CONSTRAINT chk_quantity CHECK (quantity >= 0),

    INDEX idx_products_product_id (product_id),
    INDEX idx_products_name       (name),
    INDEX idx_products_quantity   (quantity)
);
