package com.crowdfund.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class DonationRequest {
    @NotNull
    @Min(1)
    private Double amount;

    private String donorName;     // optional
    private String donorEmail;    // optional
    private boolean anonymous;    // default false
    private String message;       // optional

    // Getters & Setters
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorEmail() { return donorEmail; }
    public void setDonorEmail(String donorEmail) { this.donorEmail = donorEmail; }

    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
