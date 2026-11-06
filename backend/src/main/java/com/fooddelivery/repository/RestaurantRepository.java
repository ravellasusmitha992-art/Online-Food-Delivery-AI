package com.fooddelivery.repository;

import com.fooddelivery.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** RestaurantRepository - CRUD for restaurants table */
@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findBySellerId(Long sellerId);

    Optional<Restaurant> findByIdAndSellerId(Long id, Long sellerId);
}
