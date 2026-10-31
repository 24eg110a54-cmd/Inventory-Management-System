package com.inventory.config;

import com.inventory.model.Product;
import com.inventory.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initDatabase(ProductRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                log.info("Database is empty. Seeding initial inventory products for the shop owner...");

                List<Product> seedProducts = Arrays.asList(
                    new Product("PRD-101", "Whole Wheat Bread", "Bakery", new BigDecimal("45.00"), 18, "Fresh baked 400g loaf"),
                    new Product("PRD-102", "Farm Fresh Milk (1L)", "Dairy", new BigDecimal("60.00"), 3, "Pasteurized whole milk (Low stock warning!)"),
                    new Product("PRD-103", "Organic Arabica Coffee (250g)", "Beverages", new BigDecimal("320.00"), 2, "Single-origin roast (Low stock warning!)"),
                    new Product("PRD-104", "Extra Virgin Olive Oil (500ml)", "Pantry", new BigDecimal("550.00"), 12, "Cold-pressed extra virgin oil"),
                    new Product("PRD-105", "Basmati Rice (5kg)", "Grains", new BigDecimal("480.00"), 0, "Premium aged long-grain rice (Out of stock!)"),
                    new Product("PRD-106", "Brown Sugar (1kg)", "Pantry", new BigDecimal("85.00"), 25, "Unrefined cane sugar"),
                    new Product("PRD-107", "Dark Chocolate 70%", "Snacks", new BigDecimal("150.00"), 4, "Rich artisanal dark chocolate (Low stock warning!)"),
                    new Product("PRD-108", "Herbal Green Tea (25 bags)", "Beverages", new BigDecimal("190.00"), 14, "Pure antioxidant green tea blend"),
                    new Product("PRD-109", "Spiral College Notebook (200 pages)", "Stationery", new BigDecimal("75.00"), 40, "Ruled hardcover notebook")
                );

                repository.saveAll(seedProducts);
                log.info("Successfully seeded {} products. Low-stock warnings are now active for testing.", seedProducts.size());
            } else {
                log.info("Database already contains {} products. Skipping seeding.", repository.count());
            }
        };
    }
}
