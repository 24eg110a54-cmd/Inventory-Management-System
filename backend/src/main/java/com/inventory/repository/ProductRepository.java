package com.inventory.repository;

import com.inventory.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Unique Product ID checks and lookup
    boolean existsByProductId(String productId);

    Optional<Product> findByProductId(String productId);

    // Find products by low-stock threshold (quantity < 5)
    List<Product> findByQuantityLessThanOrderByQuantityAsc(Integer threshold);

    // Count of low stock items
    long countByQuantityLessThan(Integer threshold);

    // Count of zero stock items
    long countByQuantity(Integer quantity);

    // Search by name (case-insensitive substring) or productId (case-insensitive substring)
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.productId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(p.category IS NOT NULL AND LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(@Param("query") String query);

    // Search low-stock products with query
    @Query("SELECT p FROM Product p WHERE p.quantity < :threshold AND (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.productId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(p.category IS NOT NULL AND LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))) " +
           "ORDER BY p.quantity ASC")
    List<Product> searchLowStockProducts(@Param("threshold") Integer threshold, @Param("query") String query);
}
