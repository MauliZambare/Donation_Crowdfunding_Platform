package com.crowdfund.backend.config;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration
public class CloudinaryConfig {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryConfig.class);

    @Value("${cloudinary.url:}")
    private String cloudinaryUrl;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (!isBlank(cloudinaryUrl)) {
            log.debug("Cloudinary configuration loaded via CLOUDINARY_URL. cloudName={}", extractCloudName(cloudinaryUrl));
            return new Cloudinary(cloudinaryUrl);
        }

        List<String> missing = new ArrayList<>();
        if (isBlank(cloudName)) missing.add("CLOUDINARY_CLOUD_NAME");
        if (isBlank(apiKey)) missing.add("CLOUDINARY_API_KEY");
        if (isBlank(apiSecret)) missing.add("CLOUDINARY_API_SECRET");

        if (!missing.isEmpty()) {
            throw new IllegalStateException(
                "Cloudinary configuration missing. Set CLOUDINARY_URL or " + String.join(", ", missing) + "."
            );
        }

        log.debug("Cloudinary configuration loaded. cloudName={}, apiKeyPresent={}, apiSecretPresent={}",
            cloudName, !isBlank(apiKey), !isBlank(apiSecret));

        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);

        return new Cloudinary(config);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String extractCloudName(String url) {
        int atIndex = url.lastIndexOf('@');
        if (atIndex >= 0 && atIndex + 1 < url.length()) {
            return url.substring(atIndex + 1);
        }
        return "unknown";
    }
}
