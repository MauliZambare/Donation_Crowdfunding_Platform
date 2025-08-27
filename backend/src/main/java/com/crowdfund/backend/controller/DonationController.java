package com.crowdfund.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crowdfund.backend.dto.DonationRequest;
import com.crowdfund.backend.dto.DonationResponse;
import com.crowdfund.backend.model.Donation;
import com.crowdfund.backend.service.DonationManager;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class DonationController {

    private final DonationManager donationManager;

    public DonationController(DonationManager donationManager) {
        this.donationManager = donationManager;
    }

    // ✅ Create donation for a campaign by a user
    @PostMapping("/campaigns/{campaignId}/users/{userId}/donations")
    public ResponseEntity<DonationResponse> donate(
            @PathVariable String campaignId,
            @PathVariable String userId,
            @Valid @RequestBody DonationRequest request
    ) {
        DonationResponse response = donationManager.donate(campaignId, userId, request);
        return ResponseEntity.ok(response);
    }

    // ✅ List donations of a campaign
    @GetMapping("/campaigns/{campaignId}/donations")
    public ResponseEntity<List<Donation>> listByCampaign(@PathVariable String campaignId) {
        return ResponseEntity.ok(donationManager.listByCampaign(campaignId));
    }

    // ✅ Get single donation
    @GetMapping("/donations/{id}")
    public ResponseEntity<Donation> getOne(@PathVariable String id) {
        return ResponseEntity.ok(donationManager.getById(id));
    }
}
