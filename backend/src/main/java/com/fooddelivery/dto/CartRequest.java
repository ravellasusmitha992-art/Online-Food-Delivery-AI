package com.fooddelivery.dto;

import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * CartRequest DTO - used when adding/updating cart items
 */
@Data
public class CartRequest {
    @NotNull(message = "Menu item ID is required")
    private Long menuItemId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;
}
