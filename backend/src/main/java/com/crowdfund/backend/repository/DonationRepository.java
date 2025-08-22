package com.crowdfund.backend.repository;

import com.crowdfund.backend.model.Donation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DonationRepository extends MongoRepository<Donation, String> {
    List<Donation> findByCampaignId(String campaignId);
}
