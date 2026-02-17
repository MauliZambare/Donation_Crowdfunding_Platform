package com.crowdfund.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
public class UserRegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @Pattern(
        regexp = "^\\+[1-9]\\d{9,14}$",
        message = "phoneNumber must be in E.164 format, e.g. +919876543210"
    )
    private String phoneNumber;

    @NotBlank(message = "User type is required")
    private String userType; // "donor" or "ngo"

    // Optional bank details for NGOs
    private String bankAccount;
    private String bankIFSC;
}
