package com.crowdfund.backend.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "otp_verification")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtpVerification {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("phone_number")
    private String phoneNumber;

    @Field("otp")
    private String otp;

    @Field("expiry_time")
    private Instant expiryTime;

    @Field("is_verified")
    private boolean isVerified;

    @Field("verify_attempts")
    private int verifyAttempts;

    @Field("send_count")
    private int sendCount;

    @Field("window_start")
    private Instant windowStart;

    @Field("last_sent_at")
    private Instant lastSentAt;
}
