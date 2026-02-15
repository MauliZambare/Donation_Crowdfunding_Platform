package com.crowdfund.backend.dto;

public class PaymentVerificationResponse {

    private String message;
    private String receiptId;
    private String paymentId;
    private String orderId;
    private String receiptDownloadUrl;
    private boolean emailSent;
    private boolean alreadyProcessed;

    public PaymentVerificationResponse() {
    }

    public PaymentVerificationResponse(
        String message,
        String receiptId,
        String paymentId,
        String orderId,
        String receiptDownloadUrl,
        boolean emailSent,
        boolean alreadyProcessed
    ) {
        this.message = message;
        this.receiptId = receiptId;
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.receiptDownloadUrl = receiptDownloadUrl;
        this.emailSent = emailSent;
        this.alreadyProcessed = alreadyProcessed;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReceiptId() {
        return receiptId;
    }

    public void setReceiptId(String receiptId) {
        this.receiptId = receiptId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getReceiptDownloadUrl() {
        return receiptDownloadUrl;
    }

    public void setReceiptDownloadUrl(String receiptDownloadUrl) {
        this.receiptDownloadUrl = receiptDownloadUrl;
    }

    public boolean isEmailSent() {
        return emailSent;
    }

    public void setEmailSent(boolean emailSent) {
        this.emailSent = emailSent;
    }

    public boolean isAlreadyProcessed() {
        return alreadyProcessed;
    }

    public void setAlreadyProcessed(boolean alreadyProcessed) {
        this.alreadyProcessed = alreadyProcessed;
    }
}
