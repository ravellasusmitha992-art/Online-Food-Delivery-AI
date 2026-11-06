package com.fooddelivery.service;

import com.fooddelivery.dto.CartRequest;
import com.fooddelivery.entity.CartItem;
import com.fooddelivery.entity.MenuItem;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.ForbiddenOperationException;
import com.fooddelivery.repository.CartItemRepository;
import com.fooddelivery.repository.MenuItemRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * CartService - manages a user's shopping cart
 *
 * Logic:
 * - If item already in cart → update quantity
 * - If new item → create new cart item
 * - Quantity 0 → remove from cart
 */
@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    /** Get all items in a user's cart */
    public List<CartItem> getCartItems(String email) {
        User user = getUserByEmail(email);
        return cartItemRepository.findByUserId(user.getId());
    }

    /**
     * Add item to cart or update quantity if already present
     */
    public CartItem addToCart(String email, CartRequest request) {
        User user = getUserByEmail(email);
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        // Check if item already exists in user's cart
        Optional<CartItem> existing = cartItemRepository
                .findByUserIdAndMenuItemId(user.getId(), menuItem.getId());

        if (existing.isPresent()) {
            // Update quantity instead of creating duplicate
            CartItem cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            return cartItemRepository.save(cartItem);
        } else {
            // Create new cart item
            CartItem cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setMenuItem(menuItem);
            cartItem.setQuantity(request.getQuantity());
            return cartItemRepository.save(cartItem);
        }
    }

    /**
     * Update quantity of a specific cart item
     * If quantity is 0, remove the item
     */
    @Transactional
    public CartItem updateCartItem(Long cartItemId, Integer quantity, String email) {

        if (quantity == null) {
            throw new RuntimeException("Quantity cannot be null");
        }

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Security check
        User user = getUserByEmail(email);
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You cannot modify another user's cart item");
        }

        // Prevent negative values
        if (quantity < 0) {
            throw new RuntimeException("Quantity cannot be negative");
        }

        // If quantity becomes 0 → delete item
        if (quantity == 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        // Update quantity
        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }
    /** Remove a specific item from cart */
    public void removeFromCart(Long cartItemId, String email) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Security check
        User user = getUserByEmail(email);
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You cannot remove another user's cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    /** Clear all items from a user's cart (called after order placement) */
    @Transactional
    public void clearCart(String email) {
        User user = getUserByEmail(email);
        cartItemRepository.deleteByUserId(user.getId());
    }

    // Helper: find user by email
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
