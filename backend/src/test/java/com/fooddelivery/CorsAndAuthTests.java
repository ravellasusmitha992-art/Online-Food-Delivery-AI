package com.fooddelivery;

import com.fooddelivery.dto.AuthResponse;
import com.fooddelivery.dto.RegisterRequest;
import com.fooddelivery.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CorsAndAuthTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    public void testCorsPreflightOnRegisterEndpointForPort5175() throws Exception {
        mockMvc.perform(options("/api/auth/register")
                .header(HttpHeaders.ORIGIN, "http://localhost:5175")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5175"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
    }

    @Test
    public void testRegistrationEndpointWithCorsOrigin() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(new AuthResponse("fake-jwt-token", "test@bytesoul.com", "Test User", 1L, "USER"));

        String requestJson = """
                {
                    "name": "Test User",
                    "email": "test@bytesoul.com",
                    "mobileNumber": "9876543210",
                    "password": "password123",
                    "role": "USER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                .header(HttpHeaders.ORIGIN, "http://localhost:5175")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5175"));
    }
}
