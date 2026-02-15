package com.crowdfund.backend.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crowdfund.backend.model.Campaign;
import com.crowdfund.backend.repository.CampaignRepository;

@Service
public class CampaignManager {

    private static final Logger log = LoggerFactory.getLogger(CampaignManager.class);

    @Autowired
    private CampaignRepository campaignRepository;

    public Campaign createCampaign(Campaign campaign) {
        campaign.setImageUrl(normalizeImageUrl(campaign.getImageUrl()));
        Campaign saved = campaignRepository.save(campaign);
        log.info("Campaign saved. id={}, title={}, imageUrl={}", saved.getId(), saved.getTitle(), saved.getImageUrl());
        return saved;
    }

    public List<Campaign> getAllCampaigns() {
        List<Campaign> campaigns = campaignRepository.findAll();
        campaigns.forEach(campaign -> campaign.setImageUrl(normalizeImageUrl(campaign.getImageUrl())));
        log.info("Fetched campaigns count={}", campaigns.size());
        campaigns.forEach(campaign ->
            log.debug("Campaign from DB. id={}, title={}, imageUrl={}",
                campaign.getId(), campaign.getTitle(), campaign.getImageUrl()));
        return campaigns;
    }

    public Optional<Campaign> getCampaignById(String id) {
        Optional<Campaign> campaign = campaignRepository.findById(id);
        campaign.ifPresent(value -> value.setImageUrl(normalizeImageUrl(value.getImageUrl())));
        return campaign;
    }

    // ✅ Update Campaign
    public Campaign updateCampaign(String id, Campaign updatedCampaign) {
        return campaignRepository.findById(id).map(existing -> {
            existing.setTitle(updatedCampaign.getTitle());
            existing.setDescription(updatedCampaign.getDescription());
            existing.setTargetAmount(updatedCampaign.getTargetAmount());
            existing.setDeadline(updatedCampaign.getDeadline());
            existing.setImageUrl(normalizeImageUrl(updatedCampaign.getImageUrl()));
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

    private String normalizeImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return imageUrl;
        }
        if (imageUrl.startsWith("http://")) {
            return "https://" + imageUrl.substring("http://".length());
        }
        return imageUrl;
    }

}
