package com.crowdfund.backend.controller;

import com.crowdfund.backend.dto.ApiResponse;
import com.crowdfund.backend.dto.AuthData;
import com.crowdfund.backend.dto.LoginRequest;
import com.crowdfund.backend.dto.UserRegisterRequest;
import com.crowdfund.backend.dto.UserResponse;
import com.crowdfund.backend.service.AuthService;
import com.crowdfund.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> registerUser(@Valid @RequestBody UserRegisterRequest request) {
        UserResponse userResponse = UserResponse.from(userService.registerUser(request));
        return ResponseEntity.ok(
            ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Registration successful")
                .data(userResponse)
                .build()
        );
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<AuthData>> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthData authData = authService.loginWithPassword(loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(
            ApiResponse.<AuthData>builder()
                .success(true)
                .message("Login successful")
                .data(authData)
                .build()
        );
    }
}
