package com.crowdfund.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank(message = "phoneNumber is required")
    @Pattern(
        regexp = "^\\+[1-9]\\d{9,14}$",
        message = "phoneNumber must be in E.164 format, e.g. +919876543210"
    )
    private String phoneNumber;

    @NotBlank(message = "otp is required")
    @Pattern(regexp = "^\\d{6}$", message = "otp must be a 6-digit code")
    private String otp;
}
