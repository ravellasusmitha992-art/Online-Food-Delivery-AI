package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.dto.UpdateOrderStatusRequest;
import com.fooddelivery.entity.MenuItem;
import com.fooddelivery.service.OrderService;
import com.fooddelivery.service.MenuService;
import com.fooddelivery.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * SellerController - seller dashboard APIs.
 */
@RestController
@RequestMapping("/api/seller")
@PreAuthorize("hasRole('SELLER')")
public class SellerController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private OrderService orderService;

        @Autowired
        private MenuService menuService;

    @GetMapping("/restaurants")
    public ResponseEntity<ApiResponse> getOwnRestaurants(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Seller restaurants fetched",
                restaurantService.getRestaurantsBySeller(userDetails.getUsername())
        ));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse> getOwnOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Seller orders fetched",
                orderService.getSellerOrders(userDetails.getUsername())
        ));
    }

    @GetMapping("/restaurants/{restaurantId}/menu")
    public ResponseEntity<ApiResponse> getOwnRestaurantMenu(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Seller restaurant menu fetched",
                menuService.getMenuForSellerRestaurant(restaurantId, userDetails.getUsername())
        ));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Order status updated",
                orderService.updateSellerOrderStatus(id, request.getStatus(), userDetails.getUsername())
        ));
    }
}
