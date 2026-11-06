package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.dto.AuthResponse;
import com.fooddelivery.dto.LoginRequest;
import com.fooddelivery.dto.RegisterRequest;
import com.fooddelivery.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController - public endpoints for registration and login
 *
 * Endpoints:
 *   POST /api/auth/register  - create new account
 *   POST /api/auth/login     - login and get JWT
 *   GET  /api/auth/profile   - get current user profile (protected)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Register new user
     * Body: { name, email, password }
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    /**
     * Login existing user
     * Body: { email, password }
     * Returns: JWT token + user info
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    /**
     * Get current user profile
     * Requires: Bearer token in Authorization header
     * Spring Security injects the logged-in user via @AuthenticationPrincipal
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        var user = authService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Profile fetched", user));
    }
}
