package com.crowdfund.backend.dto;

public class DonationResponse {
    private String donationId;
    private String campaignId;
    private double amount;
    private double newRaisedAmount;
    private String paymentStatus;

    public DonationResponse() {}

    public DonationResponse(String donationId, String campaignId, double amount, double newRaisedAmount, String paymentStatus) {
        this.donationId = donationId;
        this.campaignId = campaignId;
        this.amount = amount;
        this.newRaisedAmount = newRaisedAmount;
        this.paymentStatus = paymentStatus;
    }

    public String getDonationId() { return donationId; }
    public void setDonationId(String donationId) { this.donationId = donationId; }

    public String getCampaignId() { return campaignId; }
    public void setCampaignId(String campaignId) { this.campaignId = campaignId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public double getNewRaisedAmount() { return newRaisedAmount; }
    public void setNewRaisedAmount(double newRaisedAmount) { this.newRaisedAmount = newRaisedAmount; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}
