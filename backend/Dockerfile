# =========================================================
# Stage 1: Build the Spring Boot Application
# =========================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copy Maven POM and download dependencies in advance for caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and compile jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# =========================================================
# Stage 2: Minimal Production JRE Image for Render
# =========================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Add a non-root application user for container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the built jar from the builder stage
COPY --from=builder /build/target/inventory-backend-1.0.0.jar app.jar

# Render assigns dynamic port via $PORT env var (default to 8080 if not set)
ENV PORT=8080
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT:-8080} -jar app.jar"]
