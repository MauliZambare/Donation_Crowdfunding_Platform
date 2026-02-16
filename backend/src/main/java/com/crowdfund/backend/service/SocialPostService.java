package com.crowdfund.backend.service;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.crowdfund.backend.dto.ChatbotRequest;
import com.crowdfund.backend.dto.ChatbotResponse;
import com.crowdfund.backend.dto.SocialPostResponse;
import com.crowdfund.backend.model.Campaign;
import com.crowdfund.backend.repository.CampaignRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class SocialPostService {

    private static final Logger log = LoggerFactory.getLogger(SocialPostService.class);
    private static final Pattern JSON_OBJECT_PATTERN = Pattern.compile("\\{.*\\}", Pattern.DOTALL);

    private final CampaignRepository campaignRepository;
    private final ChatbotService chatbotService;
    private final ObjectMapper objectMapper;
    private final String frontendBaseUrl;

    public SocialPostService(
            CampaignRepository campaignRepository,
            ChatbotService chatbotService,
            ObjectMapper objectMapper,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.campaignRepository = campaignRepository;
        this.chatbotService = chatbotService;
        this.objectMapper = objectMapper;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public SocialPostResponse generatePostCaptions(String campaignId) {
        try {
            Optional<Campaign> campaignOptional = campaignRepository.findById(campaignId);
            if (campaignOptional.isEmpty()) {
                log.warn("Campaign not found while generating social captions. campaignId={}", campaignId);
                return buildFallbackCaptions(null, campaignId);
            }

            Campaign campaign = campaignOptional.get();
            String prompt = buildPrompt(campaign, campaignId);
            ChatbotResponse aiResponse = chatbotService.processMessage(new ChatbotRequest(prompt));
            String aiText = aiResponse == null ? null : aiResponse.getReply();

            SocialPostResponse parsed = parseAiResponse(aiText);
            if (parsed != null) {
                return parsed;
            }

            log.warn("AI response for social captions was not valid JSON. campaignId={}", campaignId);
            return buildFallbackCaptions(campaign, campaignId);
        } catch (Exception ex) {
            log.error("Failed to generate social captions. campaignId={}", campaignId, ex);
            return buildFallbackCaptions(null, campaignId);
        }
    }

    private String buildPrompt(Campaign campaign, String campaignId) {
        String title = valueOrDefault(campaign.getTitle(), "Untitled campaign");
        String description = valueOrDefault(campaign.getDescription(), "Support this meaningful cause.");
        String ngoName = valueOrDefault(campaign.getNgoName(), "Campaign Organizer");
        String campaignLink = buildCampaignLink(campaignId);

        return "You are a social media copywriter for donation campaigns. " +
                "Generate 3 platform-specific captions for Instagram, Twitter (X), and WhatsApp. " +
                "Return ONLY valid JSON with keys: instagram, twitter, whatsapp. " +
                "No markdown, no code fences, no extra text.\n" +
                "Campaign Title: " + title + "\n" +
                "Organizer: " + ngoName + "\n" +
                "Description: " + description + "\n" +
                "Target Amount: INR " + campaign.getTargetAmount() + "\n" +
                "Raised Amount: INR " + campaign.getRaisedAmount() + "\n" +
                "Campaign Link: " + campaignLink + "\n" +
                "Constraints:\n" +
                "- instagram caption: engaging and emotional, include 2-4 hashtags.\n" +
                "- twitter caption: concise and shareable, include 1-2 hashtags.\n" +
                "- whatsapp caption: simple, persuasive, and short.\n";
    }

    private SocialPostResponse parseAiResponse(String aiText) {
        if (aiText == null || aiText.isBlank()) {
            return null;
        }

        JsonNode root = parseJsonNode(aiText);
        if (root == null) {
            Matcher matcher = JSON_OBJECT_PATTERN.matcher(aiText);
            if (!matcher.find()) {
                return null;
            }
            root = parseJsonNode(matcher.group());
            if (root == null) {
                return null;
            }
        }

        String instagram = root.path("instagram").asText("").trim();
        String twitter = root.path("twitter").asText("").trim();
        String whatsapp = root.path("whatsapp").asText("").trim();

        if (instagram.isEmpty() || twitter.isEmpty() || whatsapp.isEmpty()) {
            return null;
        }

        return new SocialPostResponse(instagram, twitter, whatsapp);
    }

    private JsonNode parseJsonNode(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception ex) {
            return null;
        }
    }

    private SocialPostResponse buildFallbackCaptions(Campaign campaign, String campaignId) {
        String title = campaign == null ? "this donation campaign" : valueOrDefault(campaign.getTitle(), "this donation campaign");
        String ngoName = campaign == null ? "Campaign Organizer" : valueOrDefault(campaign.getNgoName(), "Campaign Organizer");
        String link = buildCampaignLink(campaignId);

        String instagram = "Support " + title + " by " + ngoName + ". Every contribution matters. Donate and share this cause. "
                + link + " #Donation #Crowdfunding #Support";
        String twitter = "Support " + title + ". Every contribution helps. " + link + " #Donation #Crowdfunding";
        String whatsapp = "Please support " + title + ". Your donation can make a real impact: " + link;

        return new SocialPostResponse(instagram, twitter, whatsapp);
    }

    private String buildCampaignLink(String campaignId) {
        String base = frontendBaseUrl == null ? "http://localhost:5173" : frontendBaseUrl.trim();
        if (base.endsWith("/")) {
            return base + "Dashboard/Home?campaignId=" + campaignId;
        }
        return base + "/Dashboard/Home?campaignId=" + campaignId;
    }

    private String valueOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }
}
