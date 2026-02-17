package com.crowdfund.backend.service;

import java.util.regex.Pattern;

import com.crowdfund.backend.exception.OtpServiceException;
import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class TwilioSmsService {
    private static final Logger log = LoggerFactory.getLogger(TwilioSmsService.class);
    private static final Pattern E164_PATTERN = Pattern.compile("^\\+[1-9]\\d{9,14}$");

    @Value("${TWILIO_ACCOUNT_SID:}")
    private String accountSid;

    @Value("${TWILIO_AUTH_TOKEN:}")
    private String authToken;

    @Value("${TWILIO_PHONE_NUMBER:}")
    private String twilioPhoneNumber;

    @PostConstruct
    public void logConfigurationStatus() {
        String sidFromSystemEnv = System.getenv("TWILIO_ACCOUNT_SID");
        String tokenFromSystemEnv = System.getenv("TWILIO_AUTH_TOKEN");
        String phoneFromSystemEnv = System.getenv("TWILIO_PHONE_NUMBER");
        log.info(
            "Twilio env loaded: systemEnvSidPresent={}, systemEnvTokenPresent={}, systemEnvPhonePresent={}, resolvedSidPresent={}, resolvedTokenPresent={}, resolvedPhonePresent={}, resolvedPhoneE164Valid={}",
            !isBlank(sidFromSystemEnv),
            !isBlank(tokenFromSystemEnv),
            !isBlank(phoneFromSystemEnv),
            !isBlank(accountSid),
            !isBlank(authToken),
            !isBlank(twilioPhoneNumber),
            isValidE164NoSpaces(safeTrim(twilioPhoneNumber))
        );
    }

    public void sendOtp(String toPhoneNumber, String otp) {
        String accountSid = safeTrim(this.accountSid);
        String authToken = safeTrim(this.authToken);
        String twilioPhoneNumber = safeTrim(this.twilioPhoneNumber);
        String toPhoneNumberNormalized = safeTrim(toPhoneNumber);

        validateRequiredConfiguration(accountSid, authToken, twilioPhoneNumber);

        if (!isValidE164NoSpaces(twilioPhoneNumber)) {
            throw new OtpServiceException(
                "TWILIO_PHONE_NUMBER must be in E.164 format without spaces, e.g. +18287601540",
                HttpStatus.BAD_REQUEST
            );
        }

        if (!isValidE164NoSpaces(toPhoneNumberNormalized)) {
            throw new OtpServiceException(
                "Recipient phone number must be in E.164 format without spaces, e.g. +918600828734",
                HttpStatus.BAD_REQUEST
            );
        }

        try {
            Twilio.init(accountSid, authToken);
            Message.creator(
                new PhoneNumber(toPhoneNumberNormalized),
                new PhoneNumber(twilioPhoneNumber),
                "Your OTP is " + otp
            ).create();
            log.info("OTP SMS sent successfully. to={}, from={}", maskPhone(toPhoneNumberNormalized), maskPhone(twilioPhoneNumber));
        } catch (ApiException ex) {
            String exactMessage = getExactExceptionMessage(ex);
            log.error("Twilio REST error while sending OTP. to={}, message={}", maskPhone(toPhoneNumberNormalized), exactMessage, ex);
            throw new OtpServiceException(exactMessage, HttpStatus.BAD_GATEWAY);
        } catch (Exception ex) {
            String exactMessage = getExactExceptionMessage(ex);
            log.error("Unexpected error while sending OTP. to={}, message={}", maskPhone(toPhoneNumberNormalized), exactMessage, ex);
            throw new OtpServiceException(exactMessage, HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private void validateRequiredConfiguration(String accountSid, String authToken, String twilioPhoneNumber) {
        if (isBlank(accountSid)) {
            throw new OtpServiceException("TWILIO_ACCOUNT_SID is missing or empty", HttpStatus.BAD_REQUEST);
        }
        if (isBlank(authToken)) {
            throw new OtpServiceException("TWILIO_AUTH_TOKEN is missing or empty", HttpStatus.BAD_REQUEST);
        }
        if (isBlank(twilioPhoneNumber)) {
            throw new OtpServiceException("TWILIO_PHONE_NUMBER is missing or empty", HttpStatus.BAD_REQUEST);
        }
    }

    private boolean isValidE164NoSpaces(String phoneNumber) {
        if (phoneNumber == null) {
            return false;
        }
        String trimmed = phoneNumber.trim();
        return E164_PATTERN.matcher(trimmed).matches() && !trimmed.contains(" ");
    }

    private String getExactExceptionMessage(Exception ex) {
        if (ex == null || isBlank(ex.getMessage())) {
            return "Unknown OTP SMS error";
        }
        return ex.getMessage();
    }

    private String maskPhone(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 6) {
            return "******";
        }
        return phoneNumber.substring(0, 3) + "****" + phoneNumber.substring(phoneNumber.length() - 2);
    }
}
