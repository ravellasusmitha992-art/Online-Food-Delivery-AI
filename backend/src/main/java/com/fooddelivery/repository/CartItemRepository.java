package com.fooddelivery.repository;

import com.fooddelivery.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/** CartItemRepository - manages cart persistence per user */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Get all cart items for a specific user
    List<CartItem> findByUserId(Long userId);

    // Find a specific item in a user's cart (to update quantity)
    Optional<CartItem> findByUserIdAndMenuItemId(Long userId, Long menuItemId);

    // Delete all cart items for a user (after order placement)
    void deleteByUserId(Long userId);
}
