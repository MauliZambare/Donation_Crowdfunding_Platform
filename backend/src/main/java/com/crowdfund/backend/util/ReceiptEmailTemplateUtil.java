package com.crowdfund.backend.util;

import java.time.format.DateTimeFormatter;

import com.crowdfund.backend.model.Receipt;

public final class ReceiptEmailTemplateUtil {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private ReceiptEmailTemplateUtil() {
    }

    public static String subject(Receipt receipt) {
        return "Donation Receipt - Payment " + receipt.getPaymentId();
    }

    public static String body(Receipt receipt) {
        String donationDate = receipt.getDonationDateTime() == null
            ? "N/A"
            : receipt.getDonationDateTime().format(DATE_TIME_FORMATTER);

        return "Dear " + receipt.getDonorName() + ",\n\n"
            + "Thank you for your donation.\n\n"
            + "Receipt details:\n"
            + "- Amount: INR " + receipt.getAmount() + "\n"
            + "- Payment ID: " + receipt.getPaymentId() + "\n"
            + "- Order ID: " + receipt.getOrderId() + "\n"
            + "- Donation Date & Time: " + donationDate + "\n\n"
            + "Please find your PDF receipt attached.\n\n"
            + "Regards,\n"
            + "Donation Crowdfunding Platform";
    }
}
