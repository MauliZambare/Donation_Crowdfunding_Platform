package com.crowdfund.backend.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crowdfund.backend.model.Campaign;
import com.crowdfund.backend.model.User;
import com.crowdfund.backend.repository.CampaignRepository;
import com.crowdfund.backend.repository.UserRepository;

@Service
public class CampaignManager {

    private static final Logger log = LoggerFactory.getLogger(CampaignManager.class);

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private UserRepository userRepository;

    public Campaign createCampaign(Campaign campaign) {
        if (campaign.getCreatedAt() == null) {
            campaign.setCreatedAt(new Date());
        }
        campaign.setImageUrl(normalizeImageUrl(campaign.getImageUrl()));
        campaign.setNgoName(resolveNgoName(campaign));
        Campaign saved = campaignRepository.save(campaign);
        log.info("Campaign saved. id={}, title={}, ngoName={}, imageUrl={}",
            saved.getId(), saved.getTitle(), saved.getNgoName(), saved.getImageUrl());
        return saved;
    }

    public List<Campaign> getAllCampaigns() {
        List<Campaign> campaigns = campaignRepository.findAll();
        campaigns.forEach(this::normalizeAndBackfillCampaign);
        log.info("Fetched campaigns count={}", campaigns.size());
        campaigns.forEach(campaign ->
            log.debug("Campaign from DB. id={}, title={}, ngoName={}, imageUrl={}",
                campaign.getId(), campaign.getTitle(), campaign.getNgoName(), campaign.getImageUrl()));
        return campaigns;
    }

    public Optional<Campaign> getCampaignById(String id) {
        Optional<Campaign> campaign = campaignRepository.findById(id);
        campaign.ifPresent(this::normalizeAndBackfillCampaign);
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
            if (updatedCampaign.getNgoName() != null && !updatedCampaign.getNgoName().isBlank()) {
                existing.setNgoName(updatedCampaign.getNgoName());
            } else if (existing.getNgoName() == null || existing.getNgoName().isBlank()) {
                existing.setNgoName(resolveNgoName(existing));
            }
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

    private void normalizeAndBackfillCampaign(Campaign campaign) {
        String normalizedImageUrl = normalizeImageUrl(campaign.getImageUrl());
        String resolvedNgoName = resolveNgoName(campaign);

        boolean changed = false;
        if (!equalsNullable(normalizedImageUrl, campaign.getImageUrl())) {
            campaign.setImageUrl(normalizedImageUrl);
            changed = true;
        }
        if (!equalsNullable(resolvedNgoName, campaign.getNgoName())) {
            campaign.setNgoName(resolvedNgoName);
            changed = true;
        }

        if (changed && campaign.getId() != null) {
            campaignRepository.save(campaign);
        }
    }

    private String resolveNgoName(Campaign campaign) {
        if (campaign.getNgoName() != null && !campaign.getNgoName().isBlank()) {
            return campaign.getNgoName();
        }
        if (campaign.getCreatorId() == null || campaign.getCreatorId().isBlank()) {
            return campaign.getNgoName();
        }
        Optional<User> creator = userRepository.findById(campaign.getCreatorId());
        return creator.map(User::getName).orElse(campaign.getNgoName());
    }

    private boolean equalsNullable(String a, String b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }

}
