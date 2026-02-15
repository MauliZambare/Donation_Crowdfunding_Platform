package com.crowdfund.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.crowdfund.backend.model.Receipt;
import com.crowdfund.backend.util.ReceiptEmailTemplateUtil;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendReceiptEmail(Receipt receipt, byte[] receiptPdfBytes) {
        if (receipt.getDonorEmail() == null || receipt.getDonorEmail().isBlank()) {
            throw new IllegalArgumentException("Donor email is required to send receipt.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            if (mailFrom != null && !mailFrom.isBlank()) {
                helper.setFrom(mailFrom.trim());
            }
            helper.setTo(receipt.getDonorEmail());
            helper.setSubject(ReceiptEmailTemplateUtil.subject(receipt));
            helper.setText(ReceiptEmailTemplateUtil.body(receipt));
            helper.addAttachment(
                "receipt-" + receipt.getPaymentId() + ".pdf",
                new ByteArrayResource(receiptPdfBytes)
            );

            mailSender.send(message);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to send receipt email", ex);
        }
    }
}
