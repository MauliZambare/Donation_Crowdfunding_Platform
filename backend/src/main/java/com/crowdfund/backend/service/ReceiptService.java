package com.crowdfund.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.crowdfund.backend.dto.PaymentVerificationRequest;
import com.crowdfund.backend.model.Receipt;
import com.crowdfund.backend.repository.ReceiptRepository;

@Service
public class ReceiptService {

    private static final Logger log = LoggerFactory.getLogger(ReceiptService.class);

    private final ReceiptRepository receiptRepository;
    private final PdfService pdfService;
    private final EmailService emailService;

    public ReceiptService(
        ReceiptRepository receiptRepository,
        PdfService pdfService,
        EmailService emailService
    ) {
        this.receiptRepository = receiptRepository;
        this.pdfService = pdfService;
        this.emailService = emailService;
    }

    public ReceiptProcessingResult processVerifiedPayment(PaymentVerificationRequest request) {
        Optional<Receipt> existingReceipt = receiptRepository.findByPaymentId(request.getRazorpayPaymentId());
        if (existingReceipt.isPresent()) {
            return new ReceiptProcessingResult(existingReceipt.get(), false, true);
        }

        Receipt receipt = new Receipt();
        receipt.setCampaignId(request.getCampaignId());
        receipt.setUserId(request.getUserId());
        receipt.setDonorName(request.getDonorName());
        receipt.setDonorEmail(request.getDonorEmail());
        receipt.setDonorPhone(request.getDonorPhone());
        receipt.setAmount(request.getAmount());
        receipt.setCurrency("INR");
        receipt.setPaymentId(request.getRazorpayPaymentId());
        receipt.setOrderId(request.getRazorpayOrderId());
        receipt.setDonationDateTime(LocalDateTime.now());

        Receipt savedReceipt = receiptRepository.save(receipt);
        boolean emailSent = false;

        try {
            byte[] pdfBytes = pdfService.generateReceiptPdf(savedReceipt);
            emailService.sendReceiptEmail(savedReceipt, pdfBytes);
            emailSent = true;
        } catch (Exception ex) {
            // Keep receipt persistence successful even if email fails.
            log.error("Receipt created but email failed for paymentId={}", savedReceipt.getPaymentId(), ex);
        }

        return new ReceiptProcessingResult(savedReceipt, emailSent, false);
    }

    public Optional<Receipt> findByPaymentId(String paymentId) {
        return receiptRepository.findByPaymentId(paymentId);
    }

    public byte[] generateReceiptPdf(Receipt receipt) {
        return pdfService.generateReceiptPdf(receipt);
    }

    public record ReceiptProcessingResult(Receipt receipt, boolean emailSent, boolean alreadyProcessed) {
    }
}
