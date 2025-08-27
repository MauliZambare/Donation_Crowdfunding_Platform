package com.crowdfund.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String campaignId;   // Which campaign is funded
    private String donorName;
    private String donorEmail;
    private double amount;
    private String paymentDate;

    public Payment() {}

    public Payment(String campaignId, String donorName, String donorEmail, double amount, String paymentDate) {
        this.campaignId = campaignId;
        this.donorName = donorName;
        this.donorEmail = donorEmail;
        this.amount = amount;
        this.paymentDate = paymentDate;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCampaignId() { return campaignId; }
    public void setCampaignId(String campaignId) { this.campaignId = campaignId; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorEmail() { return donorEmail; }
    public void setDonorEmail(String donorEmail) { this.donorEmail = donorEmail; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getPaymentDate() { return paymentDate; }
    public void setPaymentDate(String paymentDate) { this.paymentDate = paymentDate; }
}
