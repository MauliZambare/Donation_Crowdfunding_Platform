package com.crowdfund.backend.controller;

import com.crowdfund.backend.dto.DonationRequest;
import com.crowdfund.backend.dto.DonationResponse;
import com.crowdfund.backend.model.Donation;
import com.crowdfund.backend.service.DonationManager;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DonationController {

    private final DonationManager donationManager;

    public DonationController(DonationManager donationManager) {
        this.donationManager = donationManager;
    }

    // ✅ Create donation for a campaign
    @PostMapping("/campaigns/{campaignId}/donations")
    public ResponseEntity<DonationResponse> donate(
            @PathVariable String campaignId,
            @Valid @RequestBody DonationRequest request
    ) {
        return ResponseEntity.ok(donationManager.donate(campaignId, request));
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
