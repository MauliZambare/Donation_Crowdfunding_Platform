package com.crowdfund.backend.service;

import com.crowdfund.backend.dto.DonationRequest;
import com.crowdfund.backend.dto.DonationResponse;
import com.crowdfund.backend.model.Campaign;
import com.crowdfund.backend.model.Donation;
import com.crowdfund.backend.repository.CampaignRepository;
import com.crowdfund.backend.repository.DonationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonationManager {

    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;

    public DonationManager(DonationRepository donationRepository, CampaignRepository campaignRepository) {
        this.donationRepository = donationRepository;
        this.campaignRepository = campaignRepository;
    }

    public DonationResponse donate(String campaignId, DonationRequest req) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found: " + campaignId));

        Donation d = new Donation();
        d.setCampaignId(campaignId);
        d.setDonorName(req.getDonorName());
        d.setDonorEmail(req.getDonorEmail());
        d.setAnonymous(req.isAnonymous());
        d.setAmount(req.getAmount());
        d.setMessage(req.getMessage());

        // For now, mark as SUCCESS (Razorpay integration येईल तेव्हा अपडेट करू)
        d.setPaymentProvider("RAZORPAY");
        d.setPaymentStatus("SUCCESS");

        Donation saved = donationRepository.save(d);

        // raisedAmount update (simple add; production मध्ये atomic $inc वापरू शकतो)
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

    public List<Donation> listByCampaign(String campaignId) {
        return donationRepository.findByCampaignId(campaignId);
    }

    public Donation getById(String id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found: " + id));
    }
}
