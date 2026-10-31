package com.inventory.controller;

import com.inventory.dto.InventoryStatsResponse;
import com.inventory.dto.ProductRequest;
import com.inventory.dto.StockUpdateRequest;
import com.inventory.model.Product;
import com.inventory.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // CrossOrigin is also configured in CorsConfig
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Display all products, with optional filtering for low-stock items or search queries.
     * Examples:
     *   GET /api/products
     *   GET /api/products?lowStock=true
     *   GET /api/products?search=milk
     *   GET /api/products?lowStock=true&search=milk
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) Boolean lowStock,
            @RequestParam(required = false) String search) {
        List<Product> products = productService.getAllProducts(lowStock, search);
        return ResponseEntity.ok(products);
    }

    /**
     * Get a single product by its database ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    /**
     * Search products by product ID or name.
     */
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String query) {
        List<Product> products = productService.getAllProducts(false, query);
        return ResponseEntity.ok(products);
    }

    /**
     * Get product by its unique business Product ID (e.g., "PRD-001").
     */
    @GetMapping("/by-product-id/{productId}")
    public ResponseEntity<Product> getProductByProductId(@PathVariable String productId) {
        Product product = productService.getProductByProductId(productId);
        return ResponseEntity.ok(product);
    }

    /**
     * Add a product with product ID, name, price, and quantity in stock.
     * Validates uniqueness of product ID and non-negative constraints.
     */
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        Product created = productService.createProduct(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Update a product's price, stock quantity, name, or category.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        Product updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Quick stock quantity update.
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request) {
        Product updated = productService.updateStock(id, request.getQuantity());
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a product from inventory.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Show low-stock warning items when quantity is below 5.
     */
    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts() {
        List<Product> lowStock = productService.getLowStockProducts();
        return ResponseEntity.ok(lowStock);
    }

    /**
     * Get summary inventory metrics for the shop owner dashboard.
     */
    @GetMapping("/stats")
    public ResponseEntity<InventoryStatsResponse> getStats() {
        InventoryStatsResponse stats = productService.getInventoryStats();
        return ResponseEntity.ok(stats);
    }
}
