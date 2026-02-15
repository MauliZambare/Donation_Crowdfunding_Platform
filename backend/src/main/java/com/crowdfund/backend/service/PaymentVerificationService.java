package com.crowdfund.backend.service;

import org.springframework.stereotype.Service;

import com.crowdfund.backend.dto.PaymentVerificationRequest;
import com.crowdfund.backend.dto.PaymentVerificationResponse;
import com.crowdfund.backend.exception.BadRequestException;
import com.crowdfund.backend.model.Receipt;
import com.crowdfund.backend.service.ReceiptService.ReceiptProcessingResult;
import com.crowdfund.backend.util.RazorpaySignatureUtil;

@Service
public class PaymentVerificationService {

    private final RazorpaySignatureUtil razorpaySignatureUtil;
    private final ReceiptService receiptService;

    public PaymentVerificationService(
        RazorpaySignatureUtil razorpaySignatureUtil,
        ReceiptService receiptService
    ) {
        this.razorpaySignatureUtil = razorpaySignatureUtil;
        this.receiptService = receiptService;
    }

    public PaymentVerificationResponse verifyAndProcessReceipt(PaymentVerificationRequest request) {
        boolean signatureValid = razorpaySignatureUtil.isSignatureValid(
            request.getRazorpayOrderId(),
            request.getRazorpayPaymentId(),
            request.getRazorpaySignature()
        );

        if (!signatureValid) {
            throw new BadRequestException("Invalid Razorpay signature. Payment verification failed.");
        }

        ReceiptProcessingResult processingResult = receiptService.processVerifiedPayment(request);
        Receipt receipt = processingResult.receipt();

        String message = processingResult.alreadyProcessed()
            ? "Payment already verified. Existing receipt returned."
            : (processingResult.emailSent()
                ? "Payment verified, receipt saved, and email sent."
                : "Payment verified and receipt saved, but email sending failed.");

        return new PaymentVerificationResponse(
            message,
            receipt.getId(),
            receipt.getPaymentId(),
            receipt.getOrderId(),
            "/api/receipt/download/" + receipt.getPaymentId(),
            processingResult.emailSent(),
            processingResult.alreadyProcessed()
        );
    }
}
