package com.fooddelivery.service;

import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.ForbiddenOperationException;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * RestaurantService - business logic for restaurant management
 */
@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserRepository userRepository;

    /** Return all restaurants in the system */
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    /** Get a single restaurant by ID */
    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + id));
    }

    public List<Restaurant> getRestaurantsBySeller(String email) {
        User seller = getUserByEmail(email);
        return restaurantRepository.findBySellerId(seller.getId());
    }

    /** Add a new restaurant */
    public Restaurant addRestaurant(Restaurant restaurant, String sellerEmail) {
        User seller = getUserByEmail(sellerEmail);
        restaurant.setSeller(seller);
        return restaurantRepository.save(restaurant);
    }

    /** Update restaurant details */
    public Restaurant updateRestaurant(Long id, Restaurant updated, String sellerEmail) {
        Restaurant existing = getRestaurantForSeller(id, sellerEmail);
        existing.setName(updated.getName());
        existing.setLocation(updated.getLocation());
        existing.setCuisineType(updated.getCuisineType());
        existing.setRating(updated.getRating());
        existing.setDeliveryTime(updated.getDeliveryTime());
        return restaurantRepository.save(existing);
    }

    /** Delete a restaurant */
    public void deleteRestaurant(Long id, String sellerEmail) {
        Restaurant existing = getRestaurantForSeller(id, sellerEmail);
        restaurantRepository.delete(existing);
    }

    public Restaurant getRestaurantForSeller(Long restaurantId, String sellerEmail) {
        User seller = getUserByEmail(sellerEmail);
        return restaurantRepository.findByIdAndSellerId(restaurantId, seller.getId())
                .orElseThrow(() -> new ForbiddenOperationException("You cannot access another seller's restaurant"));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
