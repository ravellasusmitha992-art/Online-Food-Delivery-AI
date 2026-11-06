package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.dto.CartRequest;
import com.fooddelivery.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * CartController - manage the logged-in user's cart
 * All endpoints require authentication (JWT)
 *
 * Endpoints:
 *   GET    /api/cart           - view cart
 *   POST   /api/cart           - add item to cart
 *   PUT    /api/cart/{id}      - update item quantity
 *   DELETE /api/cart/{id}      - remove item from cart
 *   DELETE /api/cart/clear     - empty the cart
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    /** Get all items in the logged-in user's cart */
    @GetMapping
    public ResponseEntity<ApiResponse> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            ApiResponse.ok("Cart fetched", cartService.getCartItems(userDetails.getUsername())));
    }

    /** Add a menu item to cart */
    @PostMapping
    public ResponseEntity<ApiResponse> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartRequest request) {
        return ResponseEntity.ok(
            ApiResponse.ok("Item added to cart",
                cartService.addToCart(userDetails.getUsername(), request)));
    }

    /** Update quantity of a cart item */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateCartItem(
            @PathVariable Long id,
            @RequestParam Integer quantity,
            @AuthenticationPrincipal UserDetails userDetails) {
        var updated = cartService.updateCartItem(id, quantity, userDetails.getUsername());
        return ResponseEntity.ok(
            ApiResponse.ok("Item removed",null));
    }

    /** Remove a specific item from cart */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> removeFromCart(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        cartService.removeFromCart(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart"));
    }

    /** Clear all items from cart */
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared"));
    }
}
