package com.crowdfund.backend.controller;

import java.util.List;
import java.util.Optional;

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

    @Autowired
    private CampaignManager campaignManager;

    // ✅ Create Campaign
    @PostMapping
    public Campaign createCampaign(@RequestBody Campaign campaign) {
        return campaignManager.createCampaign(campaign);
    }

    // ✅ Get All Campaigns
    @GetMapping
    public List<Campaign> getAllCampaigns() {
        return campaignManager.getAllCampaigns();
    }

    // ✅ Get Campaign by ID
    @GetMapping("/{id}")
    public Optional<Campaign> getCampaignById(@PathVariable String id) {
        return campaignManager.getCampaignById(id);
    }

    // ✅ Update Campaign
    @PutMapping("/{id}")
    public Campaign updateCampaign(@PathVariable String id, @RequestBody Campaign campaign) {
        return campaignManager.updateCampaign(id, campaign);
    }

    // ✅ Delete Campaign
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCampaign(@PathVariable String id) {
        if (campaignManager.deleteCampaign(id)) {
            return ResponseEntity.ok("Campaign deleted successfully!");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
