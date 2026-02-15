package com.crowdfund.backend.util;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RazorpaySignatureUtil {

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    public boolean isSignatureValid(String orderId, String paymentId, String razorpaySignature) {
        String secret = sanitizeCredential(razorpayKeySecret);
        if (isBlank(orderId) || isBlank(paymentId) || isBlank(razorpaySignature) || isBlank(secret)) {
            return false;
        }

        String data = orderId + "|" + paymentId;
        String expectedSignature = hmacSha256(data, secret);
        return MessageDigest.isEqual(
            expectedSignature.getBytes(StandardCharsets.UTF_8),
            razorpaySignature.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
            throw new IllegalStateException("Failed to verify Razorpay signature", ex);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private String sanitizeCredential(String value) {
        if (value == null) {
            return "";
        }
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

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
