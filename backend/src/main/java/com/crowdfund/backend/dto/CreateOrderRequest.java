package com.crowdfund.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotBlank(message = "campaignId is required")
    private String campaignId;

    @NotBlank(message = "userId is required")
    private String userId;

    @NotNull(message = "amount is required")
    @Min(value = 1, message = "amount must be at least 1 INR")
    private Integer amount;
}
