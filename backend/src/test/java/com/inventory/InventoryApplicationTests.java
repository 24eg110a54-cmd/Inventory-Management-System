package com.inventory;

import com.inventory.dto.ProductRequest;
import com.inventory.exception.DuplicateProductIdException;
import com.inventory.exception.InvalidInputException;
import com.inventory.model.Product;
import com.inventory.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class InventoryApplicationTests {

    @Autowired
    private ProductService productService;

    @Test
    void contextLoads() {
        assertNotNull(productService, "ProductService should be loaded into application context");
    }

    @Test
    @DisplayName("Should successfully create a product and verify it is retrieved")
    void testCreateAndRetrieveProduct() {
        String testId = "TEST-PROD-" + System.currentTimeMillis();
        ProductRequest request = new ProductRequest(
                testId,
                "Test Honey Jar",
                "Groceries",
                new BigDecimal("120.50"),
                10,
                "Pure natural honey"
        );

        Product created = productService.createProduct(request);
        assertNotNull(created.getId());
        assertEquals(testId, created.getProductId());
        assertEquals(new BigDecimal("120.50"), created.getPrice());
        assertEquals(10, created.getQuantity());
        assertFalse(created.isLowStock(), "Quantity of 10 should not be low stock");

        Product retrieved = productService.getProductByProductId(testId);
        assertEquals("Test Honey Jar", retrieved.getName());
    }

    @Test
    @DisplayName("Should reject duplicate product ID with DuplicateProductIdException")
    void testDuplicateProductIdRejection() {
        String testId = "DUP-" + System.currentTimeMillis();
        ProductRequest req1 = new ProductRequest(testId, "Item 1", "Misc", new BigDecimal("10.00"), 5, null);
        productService.createProduct(req1);

        ProductRequest req2 = new ProductRequest(testId, "Item 2", "Misc", new BigDecimal("15.00"), 8, null);
        assertThrows(DuplicateProductIdException.class, () -> {
            productService.createProduct(req2);
        });
    }

    @Test
    @DisplayName("Should reject negative price or negative quantity")
    void testNegativePriceAndQuantityRejection() {
        ProductRequest negPrice = new ProductRequest(
                "NEG-P-" + System.currentTimeMillis(),
                "Negative Price Item",
                "Misc",
                new BigDecimal("-5.00"),
                5,
                null
        );
        assertThrows(InvalidInputException.class, () -> productService.createProduct(negPrice));

        ProductRequest negQty = new ProductRequest(
                "NEG-Q-" + System.currentTimeMillis(),
                "Negative Qty Item",
                "Misc",
                new BigDecimal("5.00"),
                -1,
                null
        );
        assertThrows(InvalidInputException.class, () -> productService.createProduct(negQty));
    }

    @Test
    @DisplayName("Should identify low stock products when quantity < 5")
    void testLowStockDetection() {
        String testId = "LOW-" + System.currentTimeMillis();
        ProductRequest lowStockReq = new ProductRequest(
                testId,
                "Low Stock Biscuit",
                "Snacks",
                new BigDecimal("20.00"),
                3, // < 5, must trigger warning
                "Butter cookies"
        );
        Product created = productService.createProduct(lowStockReq);
        assertTrue(created.isLowStock(), "Quantity 3 must trigger low-stock status");

        List<Product> lowStockList = productService.getLowStockProducts();
        boolean found = lowStockList.stream().anyMatch(p -> p.getProductId().equals(testId));
        assertTrue(found, "Low-stock product should be present in low-stock list");
    }

    @Test
    @DisplayName("Should search by name or product ID accurately")
    void testSearchProducts() {
        String uniqueSuffix = "" + System.currentTimeMillis();
        ProductRequest req = new ProductRequest(
                "SEARCH-" + uniqueSuffix,
                "Special Almonds " + uniqueSuffix,
                "Nuts",
                new BigDecimal("250.00"),
                15,
                "California almonds"
        );
        productService.createProduct(req);

        // Search by Product ID
        List<Product> resultsById = productService.getAllProducts(false, "SEARCH-" + uniqueSuffix);
        assertEquals(1, resultsById.size());

        // Search by Name
        List<Product> resultsByName = productService.getAllProducts(false, "Special Almonds");
        assertFalse(resultsByName.isEmpty());
    }

    @Test
    @DisplayName("Should update stock quantity and price successfully")
    void testUpdateStockAndPrice() {
        String testId = "UPD-" + System.currentTimeMillis();
        Product created = productService.createProduct(
                new ProductRequest(testId, "Original Name", "Test", new BigDecimal("50.00"), 10, "Original")
        );

        // Update stock via updateStock
        Product stockUpdated = productService.updateStock(created.getId(), 2);
        assertEquals(2, stockUpdated.getQuantity());
        assertTrue(stockUpdated.isLowStock(), "Quantity 2 must now trigger low stock");

        // Update price and name via updateProduct
        ProductRequest updateReq = new ProductRequest(testId, "Updated Name", "Test", new BigDecimal("75.50"), 15, "Updated");
        Product fullyUpdated = productService.updateProduct(created.getId(), updateReq);
        assertEquals("Updated Name", fullyUpdated.getName());
        assertEquals(new BigDecimal("75.50"), fullyUpdated.getPrice());
        assertEquals(15, fullyUpdated.getQuantity());
        assertFalse(fullyUpdated.isLowStock());
    }
}
