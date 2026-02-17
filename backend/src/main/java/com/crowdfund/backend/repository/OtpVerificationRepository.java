package com.crowdfund.backend.repository;

import java.util.Optional;

import com.crowdfund.backend.model.OtpVerification;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OtpVerificationRepository extends MongoRepository<OtpVerification, String> {
    Optional<OtpVerification> findByPhoneNumber(String phoneNumber);
    void deleteByPhoneNumber(String phoneNumber);
}
