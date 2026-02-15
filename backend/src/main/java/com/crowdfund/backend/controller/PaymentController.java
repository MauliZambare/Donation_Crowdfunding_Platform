package com.crowdfund.backend.controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crowdfund.backend.dto.CreateOrderRequest;
import com.crowdfund.backend.model.Payment;
import com.crowdfund.backend.repository.PaymentRepository;
import com.crowdfund.backend.service.RazorpayOrderService;
import com.razorpay.RazorpayException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RazorpayOrderService razorpayOrderService;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            Map<String, Object> orderResponse = razorpayOrderService.createOrder(request);
            return ResponseEntity.ok(orderResponse);
        } catch (IllegalArgumentException ex) {
            log.error("Invalid order request: {}", ex.getMessage(), ex);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, "Invalid order request", ex.getMessage(), "ORDER_VALIDATION_ERROR");
        } catch (IllegalStateException ex) {
            log.error("Razorpay configuration error: {}", ex.getMessage(), ex);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex.getMessage(), "RAZORPAY_CONFIG_ERROR");
        } catch (RazorpayException ex) {
            log.error("Razorpay API error while creating order: {}", ex.getMessage(), ex);
            if (isAuthenticationFailure(ex.getMessage())) {
                return buildErrorResponse(
                    HttpStatus.UNAUTHORIZED,
                    "Razorpay authentication failed",
                    "Invalid Razorpay credentials. Verify razorpay.key.id and razorpay.key.secret are a valid pair with no extra spaces or quotes.",
                    "RAZORPAY_API_AUTH_FAILED"
                );
            }
            HttpStatus status = mapRazorpayStatus(ex.getMessage());
            return buildErrorResponse(status, "Error creating Razorpay order", ex.getMessage(), "RAZORPAY_API_ERROR");
        } catch (Exception ex) {
            log.error("Unexpected payment error", ex);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected payment error", ex.getMessage(), "PAYMENT_INTERNAL_ERROR");
        }
    }

    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody Payment payment) {
        payment.setPaymentDate(LocalDateTime.now().toString());
        Payment savedPayment = paymentRepository.save(payment);
        return ResponseEntity.ok(savedPayment);
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @GetMapping("/{campaignId}")
    public ResponseEntity<List<Payment>> getPaymentsByCampaign(@PathVariable String campaignId) {
        return ResponseEntity.ok(paymentRepository.findByCampaignId(campaignId));
    }

    private HttpStatus mapRazorpayStatus(String message) {
        if (message == null) return HttpStatus.BAD_GATEWAY;
        String lower = message.toLowerCase(Locale.ROOT);
        if (lower.contains("authentication") || lower.contains("api key")) return HttpStatus.UNAUTHORIZED;
        if (lower.contains("bad request") || lower.contains("invalid")) return HttpStatus.BAD_REQUEST;
        if (lower.contains("forbidden")) return HttpStatus.FORBIDDEN;
        return HttpStatus.BAD_GATEWAY;
    }

    private boolean isAuthenticationFailure(String message) {
        if (message == null) return false;
        String lower = message.toLowerCase(Locale.ROOT);
        return lower.contains("authentication failed") || lower.contains("invalid api key") || lower.contains("api key");
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
        HttpStatus status,
        String message,
        String details,
        String errorCode
    ) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        body.put("details", details == null ? "" : details);
        body.put("errorCode", errorCode);
        return ResponseEntity.status(status).body(body);
    }
}
