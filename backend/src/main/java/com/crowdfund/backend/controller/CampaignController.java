package com.crowdfund.backend.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crowdfund.backend.model.Campaign;
import com.crowdfund.backend.service.CampaignManager;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private static final Logger log = LoggerFactory.getLogger(CampaignController.class);

    @Autowired
    private CampaignManager campaignManager;

    @PostMapping
    public Campaign createCampaign(@RequestBody Campaign campaign) {
        log.info("Create campaign request. title={}, creatorId={}, ngoName={}, imageUrl={}",
            campaign.getTitle(), campaign.getCreatorId(), campaign.getNgoName(), campaign.getImageUrl());
        Campaign savedCampaign = campaignManager.createCampaign(campaign);
        log.info("Create campaign response. id={}, ngoName={}, imageUrl={}",
            savedCampaign.getId(), savedCampaign.getNgoName(), savedCampaign.getImageUrl());
        return savedCampaign;
    }

    @GetMapping
    public List<Campaign> getAllCampaigns() {
        List<Campaign> campaigns = campaignManager.getAllCampaigns();
        log.info("GET /api/campaigns response count={}", campaigns.size());
        return campaigns;
    }

    @GetMapping("/{id}")
    public Optional<Campaign> getCampaignById(@PathVariable String id) {
        return campaignManager.getCampaignById(id);
    }

    @PutMapping("/{id}")
    public Campaign updateCampaign(@PathVariable String id, @RequestBody Campaign campaign) {
        return campaignManager.updateCampaign(id, campaign);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCampaign(@PathVariable String id) {
        if (campaignManager.deleteCampaign(id)) {
            return ResponseEntity.ok("Campaign deleted successfully!");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
