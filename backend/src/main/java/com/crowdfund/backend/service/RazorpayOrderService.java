package com.crowdfund.backend.service;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.crowdfund.backend.dto.CreateOrderRequest;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@Service
public class RazorpayOrderService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayOrderService.class);

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @Value("${razorpay.mode:test}")
    private String razorpayMode;

    public Map<String, Object> createOrder(CreateOrderRequest request) throws RazorpayException {
        RazorpayConfig config = validateConfiguration();
        validateRequest(request);

        int amountInPaise = Math.multiplyExact(request.getAmount(), 100);
        RazorpayClient razorpayClient = new RazorpayClient(config.keyId(), config.keySecret());

        JSONObject notes = new JSONObject();
        notes.put("campaignId", request.getCampaignId());
        notes.put("userId", request.getUserId());

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", buildReceipt(request.getCampaignId()));
        orderRequest.put("notes", notes);

        // Razorpay SDK order creation (docs equivalent: razorpayClient.Orders.create(orderRequest))
        Order order = razorpayClient.orders.create(orderRequest);
        JSONObject orderJson = new JSONObject(order.toString());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", orderJson.get("id"));
        response.put("order_id", orderJson.get("id"));
        response.put("amount", orderJson.get("amount"));
        response.put("currency", orderJson.get("currency"));
        response.put("receipt", orderJson.opt("receipt"));
        response.put("status", orderJson.opt("status"));
        response.put("mode", config.mode());
        response.put("message", "Razorpay order created successfully");

        log.info("Razorpay order created. orderId={}, campaignId={}, userId={}, amountInr={}, amountPaise={}, mode={}",
            orderJson.opt("id"), request.getCampaignId(), request.getUserId(), request.getAmount(), amountInPaise, config.mode());

        return response;
    }

    private RazorpayConfig validateConfiguration() {
        String keyId = sanitizeCredential(razorpayKeyId);
        String keySecret = sanitizeCredential(razorpayKeySecret);
        String mode = normalizedMode();

        if (isBlank(keyId) || isBlank(keySecret)) {
            throw new IllegalStateException(
                "Razorpay key configuration missing. Set razorpay.key.id and razorpay.key.secret in application.properties."
            );
        }

        if (!mode.equals("test") && !mode.equals("live")) {
            throw new IllegalStateException("Invalid razorpay.mode. Use 'test' or 'live'.");
        }
        if (mode.equals("test") && !keyId.startsWith("rzp_test_")) {
            throw new IllegalStateException("Razorpay mode/key mismatch. test mode requires rzp_test_ key.");
        }
        if (mode.equals("live") && !keyId.startsWith("rzp_live_")) {
            throw new IllegalStateException("Razorpay mode/key mismatch. live mode requires rzp_live_ key.");
        }

        log.info("Razorpay configuration loaded. mode={}, keyIdPrefix={}, keyIdSuffix={}",
            mode, keyId.substring(0, Math.min(8, keyId.length())), keyId.substring(Math.max(0, keyId.length() - 4)));

        return new RazorpayConfig(keyId, keySecret, mode);
    }

    private void validateRequest(CreateOrderRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required.");
        }
        if (request.getAmount() == null || request.getAmount() < 1) {
            throw new IllegalArgumentException("Amount must be at least 1 INR.");
        }
        if (isBlank(request.getCampaignId())) {
            throw new IllegalArgumentException("campaignId is required.");
        }
        if (isBlank(request.getUserId())) {
            throw new IllegalArgumentException("userId is required.");
        }
    }

    private String buildReceipt(String campaignId) {
        String sanitized = campaignId == null ? "cmp" : campaignId.replaceAll("[^A-Za-z0-9]", "");
        if (sanitized.isBlank()) sanitized = "cmp";
        String receipt = "rcpt_" + sanitized + "_" + System.currentTimeMillis();
        return receipt.length() > 40 ? receipt.substring(0, 40) : receipt;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String normalizedMode() {
        return isBlank(razorpayMode) ? "test" : razorpayMode.trim().toLowerCase(Locale.ROOT);
    }

    private String sanitizeCredential(String value) {
        if (value == null) return "";
        String sanitized = value.trim();
        if (sanitized.length() >= 2) {
            boolean hasDoubleQuotes = sanitized.startsWith("\"") && sanitized.endsWith("\"");
            boolean hasSingleQuotes = sanitized.startsWith("'") && sanitized.endsWith("'");
            if (hasDoubleQuotes || hasSingleQuotes) {
                sanitized = sanitized.substring(1, sanitized.length() - 1).trim();
            }
        }
        return sanitized;
    }

    private record RazorpayConfig(String keyId, String keySecret, String mode) {}
}
