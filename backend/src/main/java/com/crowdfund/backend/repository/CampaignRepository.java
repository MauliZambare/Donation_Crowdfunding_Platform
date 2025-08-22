package com.crowdfund.backend.repository;


import com.crowdfund.backend.model.Campaign;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CampaignRepository extends MongoRepository<Campaign, String> {
    // Additional queries if needed
}
