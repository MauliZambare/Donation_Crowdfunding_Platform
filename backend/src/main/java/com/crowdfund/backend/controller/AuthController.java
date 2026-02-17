package com.crowdfund.backend.controller;

import com.crowdfund.backend.dto.ApiResponse;
import com.crowdfund.backend.dto.AuthData;
import com.crowdfund.backend.dto.OtpSendData;
import com.crowdfund.backend.dto.SendOtpRequest;
import com.crowdfund.backend.dto.VerifyOtpRequest;
import com.crowdfund.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = "/send-otp", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<OtpSendData>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        OtpSendData data = authService.sendOtp(request.getPhoneNumber());
        return ResponseEntity.ok(
            ApiResponse.<OtpSendData>builder()
                .success(true)
                .message("OTP sent successfully")
                .data(data)
                .build()
        );
    }

    @PostMapping(value = "/verify-otp", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<AuthData>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthData data = authService.verifyOtp(request.getPhoneNumber(), request.getOtp());
        return ResponseEntity.ok(
            ApiResponse.<AuthData>builder()
                .success(true)
                .message("OTP verified successfully")
                .data(data)
                .build()
        );
    }
}
