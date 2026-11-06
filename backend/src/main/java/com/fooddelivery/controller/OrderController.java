package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.dto.OrderRequest;
import com.fooddelivery.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * OrderController - place and view orders
 * All endpoints require authentication (JWT)
 *
 * Endpoints:
 *   POST /api/orders          - place order from current cart
 *   GET  /api/orders          - get order history
 *   GET  /api/orders/{id}     - get specific order
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * Place an order
     * Converts all cart items into an order, then clears the cart
     * Body: { deliveryAddress }
     */
    @PostMapping
    public ResponseEntity<ApiResponse> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequest request) {
        var order = orderService.placeOrder(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Order placed successfully", order));
    }

    /** Get all past orders for the logged-in user */
    @GetMapping
    public ResponseEntity<ApiResponse> getOrderHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            ApiResponse.ok("Orders fetched",
                orderService.getOrderHistory(userDetails.getUsername())));
    }

    /** Get details of a specific order */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            ApiResponse.ok("Order fetched",
                orderService.getOrderById(id, userDetails.getUsername())));
    }
}
