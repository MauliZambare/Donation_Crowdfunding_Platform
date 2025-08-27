package com.crowdfund.backend.dto;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private String campaignId;
    private String userId;
    private Integer amount;
}
