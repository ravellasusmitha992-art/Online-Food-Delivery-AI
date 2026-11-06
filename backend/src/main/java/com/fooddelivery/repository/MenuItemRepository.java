package com.fooddelivery.repository;

import com.fooddelivery.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** MenuItemRepository - handles food items queries */
@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    // Get all menu items for a specific restaurant
    List<MenuItem> findByRestaurantId(Long restaurantId);

    // Get only available items for a restaurant
    List<MenuItem> findByRestaurantIdAndAvailableTrue(Long restaurantId);

    Optional<MenuItem> findByIdAndRestaurantSellerId(Long id, Long sellerId);
}
