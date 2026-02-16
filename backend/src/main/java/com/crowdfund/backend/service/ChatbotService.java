package com.crowdfund.backend.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.crowdfund.backend.dto.ChatbotRequest;
import com.crowdfund.backend.dto.ChatbotResponse;
import com.crowdfund.backend.model.ChatMessage;
import com.crowdfund.backend.repository.ChatMessageRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);
    private static final String FALLBACK_REPLY = "Chatbot service temporarily unavailable.";

    private final ChatMessageRepository chatMessageRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String geminiApiKey;
    private final String geminiApiUrl;

    public ChatbotService(
            ChatMessageRepository chatMessageRepository,
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @Value("${gemini.api.key:}") String geminiApiKey,
            @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}") String geminiApiUrl) {
        this.chatMessageRepository = chatMessageRepository;
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
        this.geminiApiKey = geminiApiKey;
        this.geminiApiUrl = geminiApiUrl;
    }

    public ChatbotResponse processMessage(ChatbotRequest request) {
        try {
            String userMessage = request == null ? null : request.getMessage();
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return new ChatbotResponse("Please enter a message.");
            }
            if (geminiApiKey == null || geminiApiKey.isBlank()) {
                log.error("Gemini API key is missing. Set gemini.api.key in application.properties");
                return new ChatbotResponse(FALLBACK_REPLY);
            }

            String trimmedMessage = userMessage.trim();
            String reply = callGemini(trimmedMessage);
            if (reply == null || reply.isBlank()) {
                return new ChatbotResponse(FALLBACK_REPLY);
            }

            saveChatMessageSafely(trimmedMessage, reply);

            return new ChatbotResponse(reply);
        } catch (Exception ex) {
            log.error("Unexpected chatbot processing error", ex);
            return new ChatbotResponse(FALLBACK_REPLY);
        }
    }

    public List<ChatMessage> getRecentMessages() {
        List<ChatMessage> latestFirst = chatMessageRepository.findTop20ByOrderByTimestampDesc();
        List<ChatMessage> oldestFirst = new ArrayList<>(latestFirst);
        java.util.Collections.reverse(oldestFirst);
        return oldestFirst;
    }

    private String callGemini(String userMessage) {
        String rawResponse = webClient
                .post()
                .uri(geminiApiUrl)
                .header("x-goog-api-key", geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(buildPayload(userMessage))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(45))
                .block();

        return extractReply(rawResponse);
    }

    private Map<String, Object> buildPayload(String userMessage) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("contents", List.of(
                Map.of("parts", List.of(
                        Map.of("text", userMessage)
                ))
        ));
        return payload;
    }

    private String extractReply(String rawResponse) {
        try {
            if (rawResponse == null || rawResponse.isBlank()) {
                log.error("Gemini returned empty response body");
                return FALLBACK_REPLY;
            }

            JsonNode rootNode = objectMapper.readTree(rawResponse);
            JsonNode candidatesNode = rootNode.path("candidates");
            if (!candidatesNode.isArray() || candidatesNode.size() == 0 || candidatesNode.get(0) == null) {
                log.error("Gemini response missing candidates array");
                return FALLBACK_REPLY;
            }

            JsonNode firstCandidate = candidatesNode.get(0);
            JsonNode partsNode = firstCandidate.path("content").path("parts");
            if (!partsNode.isArray() || partsNode.size() == 0 || partsNode.get(0) == null) {
                log.error("Gemini response missing content parts");
                return FALLBACK_REPLY;
            }

            String reply = partsNode.get(0).path("text").asText("").trim();
            if (reply.isEmpty()) {
                log.error("Gemini response contained empty text");
                return FALLBACK_REPLY;
            }
            return reply;
        } catch (Exception ex) {
            log.error("Failed to parse Gemini response JSON", ex);
            return FALLBACK_REPLY;
        }
    }

    private void saveChatMessageSafely(String userMessage, String botReply) {
        try {
            ChatMessage chatMessage = new ChatMessage(userMessage, botReply, new Date());
            chatMessageRepository.save(chatMessage);
        } catch (Exception ex) {
            log.error("Failed to save chat history", ex);
        }
    }
}
