package com.inventory.service;

import com.inventory.dto.InventoryStatsResponse;
import com.inventory.dto.ProductRequest;
import com.inventory.exception.DuplicateProductIdException;
import com.inventory.exception.InvalidInputException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.model.Product;
import com.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ProductService {

    public static final int LOW_STOCK_THRESHOLD = 5;

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts(Boolean lowStockOnly, String search) {
        boolean hasSearch = search != null && !search.trim().isEmpty();
        String query = hasSearch ? search.trim() : "";

        if (Boolean.TRUE.equals(lowStockOnly)) {
            if (hasSearch) {
                return productRepository.searchLowStockProducts(LOW_STOCK_THRESHOLD, query);
            } else {
                return productRepository.findByQuantityLessThanOrderByQuantityAsc(LOW_STOCK_THRESHOLD);
            }
        }

        if (hasSearch) {
            return productRepository.searchProducts(query);
        }

        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with internal ID: " + id));
    }

    @Transactional(readOnly = true)
    public Product getProductByProductId(String productId) {
        return productRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with Product ID: " + productId));
    }

    public Product createProduct(ProductRequest request) {
        validateBusinessRules(request.getPrice(), request.getQuantity());

        String cleanedProductId = request.getProductId().trim();
        if (productRepository.existsByProductId(cleanedProductId)) {
            throw new DuplicateProductIdException(
                "Product ID '" + cleanedProductId + "' already exists. Product IDs must be unique."
            );
        }

        Product product = new Product(
                cleanedProductId,
                request.getName().trim(),
                request.getCategory() != null ? request.getCategory().trim() : null,
                request.getPrice(),
                request.getQuantity(),
                request.getDescription() != null ? request.getDescription().trim() : null
        );

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest request) {
        validateBusinessRules(request.getPrice(), request.getQuantity());

        Product product = getProductById(id);
        String cleanedProductId = request.getProductId().trim();

        // If product ID changed, ensure new product ID is not taken by another record
        if (!product.getProductId().equalsIgnoreCase(cleanedProductId)) {
            if (productRepository.existsByProductId(cleanedProductId)) {
                throw new DuplicateProductIdException(
                    "Product ID '" + cleanedProductId + "' already exists for another product. Product IDs must be unique."
                );
            }
            product.setProductId(cleanedProductId);
        }

        product.setName(request.getName().trim());
        product.setCategory(request.getCategory() != null ? request.getCategory().trim() : null);
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        return productRepository.save(product);
    }

    public Product updateStock(Long id, Integer quantity) {
        if (quantity == null || quantity < 0) {
            throw new InvalidInputException("Stock quantity cannot be null or negative.");
        }

        Product product = getProductById(id);
        product.setQuantity(quantity);
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public List<Product> getLowStockProducts() {
        return productRepository.findByQuantityLessThanOrderByQuantityAsc(LOW_STOCK_THRESHOLD);
    }

    @Transactional(readOnly = true)
    public InventoryStatsResponse getInventoryStats() {
        List<Product> allProducts = productRepository.findAll();

        long totalProducts = allProducts.size();
        long lowStockCount = 0;
        long outOfStockCount = 0;
        long totalUnits = 0;
        BigDecimal totalValue = BigDecimal.ZERO;

        for (Product p : allProducts) {
            int qty = p.getQuantity() != null ? p.getQuantity() : 0;
            totalUnits += qty;

            if (qty < LOW_STOCK_THRESHOLD) {
                lowStockCount++;
            }
            if (qty == 0) {
                outOfStockCount++;
            }

            if (p.getPrice() != null && qty > 0) {
                BigDecimal itemTotal = p.getPrice().multiply(BigDecimal.valueOf(qty));
                totalValue = totalValue.add(itemTotal);
            }
        }

        return new InventoryStatsResponse(
                totalProducts,
                lowStockCount,
                outOfStockCount,
                totalUnits,
                totalValue
        );
    }

    private void validateBusinessRules(BigDecimal price, Integer quantity) {
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidInputException("Price cannot be negative.");
        }
        if (quantity == null || quantity < 0) {
            throw new InvalidInputException("Quantity cannot be negative.");
        }
    }
}
