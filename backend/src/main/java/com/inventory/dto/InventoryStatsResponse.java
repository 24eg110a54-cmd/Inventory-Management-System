package com.inventory.dto;

import java.math.BigDecimal;

public class InventoryStatsResponse {
    private long totalProducts;
    private long lowStockCount;
    private long outOfStockCount;
    private long totalUnits;
    private BigDecimal totalInventoryValue;

    public InventoryStatsResponse() {
    }

    public InventoryStatsResponse(long totalProducts, long lowStockCount, long outOfStockCount, long totalUnits, BigDecimal totalInventoryValue) {
        this.totalProducts = totalProducts;
        this.lowStockCount = lowStockCount;
        this.outOfStockCount = outOfStockCount;
        this.totalUnits = totalUnits;
        this.totalInventoryValue = totalInventoryValue;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(long outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }

    public long getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(long totalUnits) {
        this.totalUnits = totalUnits;
    }

    public BigDecimal getTotalInventoryValue() {
        return totalInventoryValue;
    }

    public void setTotalInventoryValue(BigDecimal totalInventoryValue) {
        this.totalInventoryValue = totalInventoryValue;
    }
}
