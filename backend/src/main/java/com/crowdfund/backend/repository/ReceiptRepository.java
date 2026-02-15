package com.crowdfund.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.crowdfund.backend.model.Receipt;

public interface ReceiptRepository extends MongoRepository<Receipt, String> {
    Optional<Receipt> findByPaymentId(String paymentId);
}
