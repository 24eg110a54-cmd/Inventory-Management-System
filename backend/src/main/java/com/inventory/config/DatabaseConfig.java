package com.inventory.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:h2:file:./data/inventorydb;DB_CLOSE_DELAY=-1}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:sa}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:}")
    private String datasourcePassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        config.setJdbcUrl(datasourceUrl);
        config.setUsername(datasourceUsername);
        config.setPassword(datasourcePassword);

        // Auto-select the correct driver based on the JDBC URL
        if (datasourceUrl.contains("mysql") || datasourceUrl.contains("tidb")) {
            // TiDB is MySQL-compatible — use MySQL connector
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            // TiDB-recommended connection pool settings
            config.setConnectionTestQuery("SELECT 1");
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setConnectionTimeout(30000);
            config.setIdleTimeout(600000);
            config.setMaxLifetime(1800000);
            log.info("Configured MySQL/TiDB DataSource: {}", maskPassword(datasourceUrl));
        } else if (datasourceUrl.contains("h2")) {
            config.setDriverClassName("org.h2.Driver");
            log.info("Configured H2 local DataSource (development mode).");
        } else {
            log.warn("Unknown DataSource URL scheme — using default driver detection: {}", datasourceUrl);
        }

        return new HikariDataSource(config);
    }

    /** Masks the password in the URL for safe logging */
    private String maskPassword(String url) {
        return url.replaceAll("password=[^&]+", "password=****")
                  .replaceAll(":[^@:/]+@", ":****@");
    }
}
