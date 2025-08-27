package com.crowdfund.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.crowdfund.backend.dto.DonationRequest;
import com.crowdfund.backend.dto.DonationResponse;
import com.crowdfund.backend.model.Campaign;
import com.crowdfund.backend.model.Donation;
import com.crowdfund.backend.model.User;
import com.crowdfund.backend.repository.CampaignRepository;
import com.crowdfund.backend.repository.DonationRepository;
import com.crowdfund.backend.repository.UserRepository;

@Service
public class DonationManager {

    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;

    public DonationManager(DonationRepository donationRepository, 
                           CampaignRepository campaignRepository,
                           UserRepository userRepository) {
        this.donationRepository = donationRepository;
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
    }

    // ✅ Create donation linked to both campaign & user
    public DonationResponse donate(String campaignId, String userId, DonationRequest req) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found: " + campaignId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Donation d = new Donation();
        d.setCampaignId(campaignId);
        d.setUserId(userId);
        d.setDonorName(req.getDonorName() != null ? req.getDonorName() : user.getName());
        d.setDonorEmail(req.getDonorEmail() != null ? req.getDonorEmail() : user.getEmail());
        d.setAnonymous(req.isAnonymous());
        d.setAmount(req.getAmount());
        d.setMessage(req.getMessage());

        // For now, mark payment as successful (Razorpay integration नंतर अपडेट करु)
        d.setPaymentProvider("RAZORPAY");
        d.setPaymentStatus("SUCCESS");

        Donation saved = donationRepository.save(d);

        // ✅ Update campaign’s raisedAmount
        campaign.setRaisedAmount(campaign.getRaisedAmount() + req.getAmount());
        campaignRepository.save(campaign);

        return new DonationResponse(
                saved.getId(),
                campaignId,
                saved.getAmount(),
                campaign.getRaisedAmount(),
                saved.getPaymentStatus()
        );
    }

    // ✅ Get donations by campaign
    public List<Donation> listByCampaign(String campaignId) {
        return donationRepository.findByCampaignId(campaignId);
    }

    // ✅ Get donation by id
    public Donation getById(String id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found: " + id));
    }
}
