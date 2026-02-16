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
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.crowdfund.backend.dto.ChatbotRequest;
import com.crowdfund.backend.dto.ChatbotResponse;
import com.crowdfund.backend.exception.ChatbotServiceException;
import com.crowdfund.backend.model.ChatMessage;
import com.crowdfund.backend.repository.ChatMessageRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);
    private static final String DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant for a donation and crowdfunding platform. "
            + "Answer clearly and briefly. If a request is unrelated, politely steer back to platform topics like campaigns, donations, NGOs, and payments.";

    private final ChatMessageRepository chatMessageRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String geminiApiKey;
    private final String geminiApiUrl;
    private final String geminiFallbackApiUrl;
    private final String chatbotSystemPrompt;

    public ChatbotService(
            ChatMessageRepository chatMessageRepository,
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @Value("${gemini.api.key:}") String geminiApiKey,
            @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}") String geminiApiUrl,
            @Value("${gemini.api.fallback-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent}") String geminiFallbackApiUrl,
            @Value("${chatbot.system-prompt:}") String chatbotSystemPrompt) {
        this.chatMessageRepository = chatMessageRepository;
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
        this.geminiApiKey = geminiApiKey;
        this.geminiApiUrl = geminiApiUrl;
        this.geminiFallbackApiUrl = geminiFallbackApiUrl;
        this.chatbotSystemPrompt = chatbotSystemPrompt;
    }

    public ChatbotResponse processMessage(ChatbotRequest request) {
        String userMessage = request.getMessage().trim();
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            log.error("Gemini API key is missing. Set gemini.api.key in application.properties");
            throw new ChatbotServiceException("Chatbot API key is not configured on server.");
        }

        String reply = callGemini(userMessage);
        saveChatMessageSafely(userMessage, reply);
        return new ChatbotResponse(reply);
    }

    public List<ChatMessage> getRecentMessages() {
        List<ChatMessage> latestFirst = chatMessageRepository.findTop20ByOrderByTimestampDesc();
        List<ChatMessage> oldestFirst = new ArrayList<>(latestFirst);
        java.util.Collections.reverse(oldestFirst);
        return oldestFirst;
    }

    private String callGemini(String userMessage) {
        ChatbotServiceException primaryFailure = null;
        try {
            return callGeminiEndpoint(geminiApiUrl, userMessage);
        } catch (ChatbotServiceException ex) {
            primaryFailure = ex;
            log.warn("Primary Gemini endpoint failed: {}", ex.getMessage());
        }

        if (geminiFallbackApiUrl != null
                && !geminiFallbackApiUrl.isBlank()
                && !geminiFallbackApiUrl.equals(geminiApiUrl)) {
            try {
                log.info("Trying fallback Gemini endpoint");
                return callGeminiEndpoint(geminiFallbackApiUrl, userMessage);
            } catch (ChatbotServiceException ex) {
                log.error("Fallback Gemini endpoint failed: {}", ex.getMessage());
                throw ex;
            }
        }

        if (primaryFailure != null) {
            throw primaryFailure;
        }

        throw new ChatbotServiceException("Unable to connect to chatbot provider right now.");
    }

    private String callGeminiEndpoint(String endpointUrl, String userMessage) {
        try {
            String urlWithKey = UriComponentsBuilder
                    .fromUriString(endpointUrl)
                    .queryParam("key", geminiApiKey)
                    .build(true)
                    .toUriString();

            String rawResponse = webClient
                    .post()
                    .uri(urlWithKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(buildPayload(userMessage))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response ->
                            response.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .map(body -> {
                                        int status = response.statusCode().value();
                                        log.error("Gemini HTTP error status={}, body={}", status, truncate(body, 500));
                                        if (status == 403) {
                                            return new ChatbotServiceException(
                                                    "Gemini access denied (403). Check API key, API restrictions, and model permissions.");
                                        }
                                        if (status == 404) {
                                            return new ChatbotServiceException(
                                                    "Gemini model endpoint not found (404). Verify model name in gemini.api.url.");
                                        }
                                        return new ChatbotServiceException("Chatbot provider failed with status " + status);
                                    }))
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(45))
                    .block();

            return extractReply(rawResponse);
        } catch (ChatbotServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Gemini API call failed for endpoint {}", endpointUrl, ex);
            throw new ChatbotServiceException("Unable to connect to chatbot provider right now.", ex);
        }
    }

    private Map<String, Object> buildPayload(String userMessage) {
        Map<String, Object> payload = new LinkedHashMap<>();
        String prompt = chatbotSystemPrompt == null || chatbotSystemPrompt.isBlank() ? DEFAULT_SYSTEM_PROMPT : chatbotSystemPrompt;
        payload.put("system_instruction", Map.of(
                "parts", List.of(Map.of("text", prompt))
        ));
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
                throw new ChatbotServiceException("Chatbot provider returned empty response.");
            }

            JsonNode rootNode = objectMapper.readTree(rawResponse);
            JsonNode candidatesNode = rootNode.path("candidates");
            if (!candidatesNode.isArray() || candidatesNode.size() == 0 || candidatesNode.get(0) == null) {
                log.error("Gemini response missing candidates array: {}", truncate(rawResponse, 500));
                throw new ChatbotServiceException("Chatbot provider returned invalid response.");
            }

            JsonNode firstCandidate = candidatesNode.get(0);
            JsonNode partsNode = firstCandidate.path("content").path("parts");
            if (!partsNode.isArray() || partsNode.size() == 0 || partsNode.get(0) == null) {
                log.error("Gemini response missing content parts: {}", truncate(rawResponse, 500));
                throw new ChatbotServiceException("Chatbot provider returned no usable reply.");
            }

            String reply = partsNode.get(0).path("text").asText("").trim();
            if (reply.isEmpty()) {
                throw new ChatbotServiceException("Chatbot provider returned empty reply.");
            }
            return reply;
        } catch (ChatbotServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to parse Gemini response JSON", ex);
            throw new ChatbotServiceException("Failed to parse chatbot response.", ex);
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

    private String truncate(String value, int maxLen) {
        if (value == null) {
            return "";
        }
        return value.length() <= maxLen ? value : value.substring(0, maxLen) + "...";
    }
}
