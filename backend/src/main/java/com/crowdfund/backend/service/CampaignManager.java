package com.crowdfund.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crowdfund.backend.model.Campaign;
import com.crowdfund.backend.repository.CampaignRepository;

@Service
public class CampaignManager {

    @Autowired
    private CampaignRepository campaignRepository;

    public Campaign createCampaign(Campaign campaign) {
        return campaignRepository.save(campaign);
    }

    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public Optional<Campaign> getCampaignById(String id) {
        return campaignRepository.findById(id);
    }

    // ✅ Update Campaign
    public Campaign updateCampaign(String id, Campaign updatedCampaign) {
        return campaignRepository.findById(id).map(existing -> {
            existing.setTitle(updatedCampaign.getTitle());
            existing.setDescription(updatedCampaign.getDescription());
            existing.setTargetAmount(updatedCampaign.getTargetAmount());
            existing.setDeadline(updatedCampaign.getDeadline());
            return campaignRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Campaign not found with id " + id));
    }

    // ✅ Delete Campaign
    public boolean deleteCampaign(String id) {
    if (campaignRepository.existsById(id)) {
        campaignRepository.deleteById(id);
        return true;
    }
    return false;
}

}
