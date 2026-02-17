package com.crowdfund.backend.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import com.crowdfund.backend.dto.AuthData;
import com.crowdfund.backend.dto.OtpSendData;
import com.crowdfund.backend.dto.UserResponse;
import com.crowdfund.backend.exception.BadRequestException;
import com.crowdfund.backend.exception.TooManyRequestsException;
import com.crowdfund.backend.exception.UnauthorizedException;
import com.crowdfund.backend.model.OtpVerification;
import com.crowdfund.backend.model.User;
import com.crowdfund.backend.repository.OtpVerificationRepository;
import com.crowdfund.backend.repository.UserRepository;
import com.crowdfund.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final TwilioSmsService twilioSmsService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    @Value("${otp.resend-min-seconds:30}")
    private int otpResendMinSeconds;

    @Value("${otp.max-send-per-hour:5}")
    private int otpMaxSendPerHour;

    @Value("${otp.max-verify-attempts:5}")
    private int otpMaxVerifyAttempts;

    public AuthData loginWithPassword(String email, String password) {
        User user = userRepository.findByEmail(email.trim())
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!isPasswordValid(password, user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return buildAuthData(user);
    }

    public OtpSendData sendOtp(String rawPhoneNumber) {
        String phoneNumber = normalizePhoneNumber(rawPhoneNumber);
        User user = userRepository.findByPhoneNumber(phoneNumber)
            .orElseThrow(() -> new BadRequestException("No account found for this phone number"));

        Instant now = Instant.now();
        OtpVerification otpVerification = otpVerificationRepository.findByPhoneNumber(phoneNumber)
            .orElse(new OtpVerification());

        if (otpVerification.getWindowStart() == null || now.isAfter(otpVerification.getWindowStart().plus(1, ChronoUnit.HOURS))) {
            otpVerification.setWindowStart(now);
            otpVerification.setSendCount(0);
        }

        if (otpVerification.getLastSentAt() != null && now.isBefore(otpVerification.getLastSentAt().plusSeconds(otpResendMinSeconds))) {
            long waitSeconds = Math.max(1, ChronoUnit.SECONDS.between(now, otpVerification.getLastSentAt().plusSeconds(otpResendMinSeconds)));
            throw new TooManyRequestsException("Please wait " + waitSeconds + " seconds before requesting another OTP");
        }

        if (otpVerification.getSendCount() >= otpMaxSendPerHour) {
            throw new TooManyRequestsException("OTP send limit exceeded. Try again after some time");
        }

        String otp = generateSixDigitOtp();
        Instant expiryTime = now.plus(otpExpiryMinutes, ChronoUnit.MINUTES);

        twilioSmsService.sendOtp(user.getPhoneNumber(), otp);

        otpVerification.setPhoneNumber(phoneNumber);
        otpVerification.setOtp(passwordEncoder.encode(otp));
        otpVerification.setExpiryTime(expiryTime);
        otpVerification.setVerified(false);
        otpVerification.setVerifyAttempts(0);
        otpVerification.setSendCount(otpVerification.getSendCount() + 1);
        otpVerification.setLastSentAt(now);
        otpVerificationRepository.save(otpVerification);

        return OtpSendData.builder()
            .phoneNumber(phoneNumber)
            .expiryTime(expiryTime)
            .resendAvailableInSeconds(otpResendMinSeconds)
            .build();
    }

    public AuthData verifyOtp(String rawPhoneNumber, String otp) {
        String phoneNumber = normalizePhoneNumber(rawPhoneNumber);
        User user = userRepository.findByPhoneNumber(phoneNumber)
            .orElseThrow(() -> new BadRequestException("No account found for this phone number"));

        OtpVerification otpVerification = otpVerificationRepository.findByPhoneNumber(phoneNumber)
            .orElseThrow(() -> new UnauthorizedException("Invalid OTP"));

        Instant now = Instant.now();
        if (otpVerification.getExpiryTime() == null || now.isAfter(otpVerification.getExpiryTime())) {
            otpVerificationRepository.deleteByPhoneNumber(phoneNumber);
            throw new UnauthorizedException("OTP expired. Please request a new OTP");
        }

        if (otpVerification.getVerifyAttempts() >= otpMaxVerifyAttempts) {
            otpVerificationRepository.deleteByPhoneNumber(phoneNumber);
            throw new TooManyRequestsException("Too many invalid OTP attempts. Please request a new OTP");
        }

        if (!passwordEncoder.matches(otp, otpVerification.getOtp())) {
            otpVerification.setVerifyAttempts(otpVerification.getVerifyAttempts() + 1);
            otpVerificationRepository.save(otpVerification);
            throw new UnauthorizedException("Invalid OTP");
        }

        otpVerification.setVerified(true);
        otpVerificationRepository.save(otpVerification);

        AuthData authData = buildAuthData(user);
        otpVerificationRepository.deleteByPhoneNumber(phoneNumber);
        return authData;
    }

    private AuthData buildAuthData(User user) {
        return AuthData.builder()
            .token(jwtService.generateToken(user))
            .user(UserResponse.from(user))
            .build();
    }

    private boolean isPasswordValid(String rawPassword, String storedPassword) {
        if (storedPassword == null || rawPassword == null) {
            return false;
        }

        if (looksLikeBcrypt(storedPassword)) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return rawPassword.equals(storedPassword);
    }

    private boolean looksLikeBcrypt(String password) {
        return password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$");
    }

    private String generateSixDigitOtp() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }

    private String normalizePhoneNumber(String phoneNumber) {
        if (phoneNumber == null) {
            throw new BadRequestException("phoneNumber is required");
        }
        String normalized = phoneNumber.trim().replaceAll("[\\s\\-()]", "");
        if (!normalized.matches("^\\+[1-9]\\d{9,14}$")) {
            throw new BadRequestException("phoneNumber must be in E.164 format, e.g. +919876543210");
        }
        return normalized;
    }
}
