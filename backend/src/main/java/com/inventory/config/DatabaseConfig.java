package com.inventory.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:}")
    private String defaultJdbcUrl;

    @Value("${spring.datasource.username:sa}")
    private String defaultUsername;

    @Value("${spring.datasource.password:}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String renderDbUrl = System.getenv("DATABASE_URL");
        HikariConfig config = new HikariConfig();

        if (renderDbUrl != null && !renderDbUrl.trim().isEmpty() &&
                (renderDbUrl.startsWith("postgres://") || renderDbUrl.startsWith("postgresql://"))) {
            log.info("Detected Render DATABASE_URL environment variable. Configuring PostgreSQL DataSource...");
            try {
                URI uri = new URI(renderDbUrl);
                String userInfo = uri.getUserInfo();
                String username = "";
                String password = "";
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath();

                // Append sslmode=require for Render external connections if query params are not present
                if (uri.getQuery() != null && !uri.getQuery().isEmpty()) {
                    jdbcUrl += "?" + uri.getQuery();
                }

                config.setDriverClassName("org.postgresql.Driver");
                config.setJdbcUrl(jdbcUrl);
                config.setUsername(username);
                config.setPassword(password);
                log.info("PostgreSQL JDBC URL configured: jdbc:postgresql://{}:{}{}", uri.getHost(), port, uri.getPath());
            } catch (URISyntaxException e) {
                log.error("Failed to parse DATABASE_URL: {}. Falling back to default configuration.", e.getMessage());
                fallbackConfig(config);
            }
        } else {
            fallbackConfig(config);
        }

        return new HikariDataSource(config);
    }

    private void fallbackConfig(HikariConfig config) {
        log.info("Using standard DataSource configuration with URL: {}", defaultJdbcUrl);
        config.setJdbcUrl(defaultJdbcUrl);
        config.setUsername(defaultUsername);
        config.setPassword(defaultPassword);
        if (defaultJdbcUrl.contains("postgresql")) {
            config.setDriverClassName("org.postgresql.Driver");
        } else if (defaultJdbcUrl.contains("h2")) {
            config.setDriverClassName("org.h2.Driver");
        }
    }
}
