package com.fooddelivery.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthFilter - runs ONCE per HTTP request (OncePerRequestFilter)
 *
 * Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Validate the token using JwtUtil
 * 3. Load user from DB and set authentication in SecurityContext
 * 4. Continue the filter chain (allow request to reach controller)
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Preflight OPTIONS requests should bypass JWT authentication
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get the Authorization header (e.g., "Bearer eyJhbGci...")
        String authHeader = request.getHeader("Authorization");

        String token = null;
        String email = null;

        // Extract token if header starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove "Bearer " prefix
            try {
                email = jwtUtil.extractEmail(token);
            } catch (Exception e) {
                // Token parsing failed - continue without authentication
            }
        }

        // If we have an email and no current authentication in context
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load user details from DB
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // Validate the token
            if (jwtUtil.validateToken(token)) {
                // Create auth token and set it in the security context
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Pass request to next filter or controller
        filterChain.doFilter(request, response);
    }
}
