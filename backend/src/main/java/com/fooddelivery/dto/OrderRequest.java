package com.fooddelivery.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

/**
 * OrderRequest DTO - sent when user places an order
 */
@Data
public class OrderRequest {
    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
}
