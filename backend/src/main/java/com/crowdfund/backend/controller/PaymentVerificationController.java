package com.crowdfund.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crowdfund.backend.dto.PaymentVerificationRequest;
import com.crowdfund.backend.dto.PaymentVerificationResponse;
import com.crowdfund.backend.service.PaymentVerificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentVerificationController {

    private final PaymentVerificationService paymentVerificationService;

    public PaymentVerificationController(PaymentVerificationService paymentVerificationService) {
        this.paymentVerificationService = paymentVerificationService;
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPaymentAndCreateReceipt(
        @Valid @RequestBody PaymentVerificationRequest request
    ) {
        PaymentVerificationResponse response = paymentVerificationService.verifyAndProcessReceipt(request);
        return ResponseEntity.ok(response);
    }
}
