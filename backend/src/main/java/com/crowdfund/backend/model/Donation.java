package com.crowdfund.backend.model;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "donations")
public class Donation {

    @Id
    private String id;

    private String campaignId;      // संबंधित कॅम्पेन ID
    private String userId;          // लॉग-इन user id (पूर्वी donorId होतं → आता बदललं)
    private String donorName;       // नाव (anonymous असेल तर रिकामं ठेव)
    private String donorEmail;      // (optional)
    private boolean anonymous;      // true = नाव लपवा

    private double amount;          // देणगी रक्कम
    private String message;         // (optional) शुभेच्छा/नोट

    // Payment meta (Razorpay integration साठी)
    private String paymentProvider;   // e.g. "RAZORPAY"
    private String paymentOrderId;    // Razorpay order_id
    private String paymentPaymentId;  // Razorpay payment_id
    private String paymentSignature;  // Razorpay signature
    private String paymentStatus;     // CREATED / SUCCESS / FAILED / REFUNDED

    private Date createdAt = new Date();

    public Donation() {}

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCampaignId() { return campaignId; }
    public void setCampaignId(String campaignId) { this.campaignId = campaignId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorEmail() { return donorEmail; }
    public void setDonorEmail(String donorEmail) { this.donorEmail = donorEmail; }

    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPaymentProvider() { return paymentProvider; }
    public void setPaymentProvider(String paymentProvider) { this.paymentProvider = paymentProvider; }

    public String getPaymentOrderId() { return paymentOrderId; }
    public void setPaymentOrderId(String paymentOrderId) { this.paymentOrderId = paymentOrderId; }

    public String getPaymentPaymentId() { return paymentPaymentId; }
    public void setPaymentPaymentId(String paymentPaymentId) { this.paymentPaymentId = paymentPaymentId; }

    public String getPaymentSignature() { return paymentSignature; }
    public void setPaymentSignature(String paymentSignature) { this.paymentSignature = paymentSignature; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
