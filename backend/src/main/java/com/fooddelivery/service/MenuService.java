package com.fooddelivery.service;

import com.fooddelivery.entity.MenuItem;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.exception.ForbiddenOperationException;
import com.fooddelivery.repository.MenuItemRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * MenuService - handles food item CRUD for restaurants
 */
@Service
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private UserRepository userRepository;

    /** Get all menu items for a restaurant */
    public List<MenuItem> getMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantIdAndAvailableTrue(restaurantId);
    }

    /** Get all menu items for a seller-owned restaurant, including unavailable ones */
    public List<MenuItem> getMenuForSellerRestaurant(Long restaurantId, String sellerEmail) {
        restaurantService.getRestaurantForSeller(restaurantId, sellerEmail);
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    /** Add a new food item to a restaurant */
    public MenuItem addMenuItem(Long restaurantId, MenuItem item, String sellerEmail) {
        Restaurant restaurant = restaurantService.getRestaurantForSeller(restaurantId, sellerEmail);
        item.setRestaurant(restaurant);
        return menuItemRepository.save(item);
    }

    /** Get a single menu item by ID */
    public MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));
    }

    /** Update a menu item */
    public MenuItem updateMenuItem(Long id, MenuItem updated, String sellerEmail) {
        MenuItem existing = getMenuItemForSeller(id, sellerEmail);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setItemType(updated.getItemType());
        existing.setCategory(updated.getCategory());
        existing.setAvailable(updated.getAvailable());
        return menuItemRepository.save(existing);
    }

    /** Delete a menu item */
    public void deleteMenuItem(Long id, String sellerEmail) {
        MenuItem existing = getMenuItemForSeller(id, sellerEmail);
        menuItemRepository.delete(existing);
    }

    private MenuItem getMenuItemForSeller(Long id, String sellerEmail) {
        MenuItem existing = getMenuItemById(id);
        Long sellerId = userRepository.findByEmail(sellerEmail)
            .orElseThrow(() -> new RuntimeException("User not found"))
            .getId();

        if (existing.getRestaurant() == null || existing.getRestaurant().getSeller() == null ||
                !existing.getRestaurant().getSeller().getId().equals(sellerId)) {
            throw new ForbiddenOperationException("You cannot modify another seller's menu item");
        }

        return existing;
    }
}
