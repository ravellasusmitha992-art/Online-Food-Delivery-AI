package com.fooddelivery.repository;

import com.fooddelivery.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/** OrderRepository - handles order history queries */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Get all orders for a specific user, newest first
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByRestaurantSellerIdOrderByCreatedAtDesc(Long sellerId);
}
