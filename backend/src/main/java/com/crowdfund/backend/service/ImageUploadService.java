package com.crowdfund.backend.service;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.crowdfund.backend.exception.BadRequestException;
import com.crowdfund.backend.exception.ImageUploadException;

@Service
public class ImageUploadService {

    private static final Logger log = LoggerFactory.getLogger(ImageUploadService.class);

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/jpg", "image/png");

    private final Cloudinary cloudinary;

    public ImageUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) {
        validateFile(file);

        try {
            String publicId = "campaign_" + UUID.randomUUID();
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "resource_type", "image",
                    "folder", "donation_campaigns",
                    "public_id", publicId,
                    "overwrite", false,
                    "invalidate", true
                )
            );

            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new ImageUploadException("Cloudinary upload failed: secure_url missing");
            }

            String finalUrl = forceHttps(secureUrl.toString());
            log.info("Cloudinary upload success. publicId={}, secureUrl={}",
                uploadResult.get("public_id"), finalUrl);
            return finalUrl;
        } catch (IOException ex) {
            throw new ImageUploadException("Failed to upload image to Cloudinary", ex);
        } catch (Exception ex) {
            throw new ImageUploadException("Cloudinary upload failed", ex);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size must be less than or equal to 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Only jpg and png files are allowed");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !hasAllowedExtension(originalFileName)) {
            throw new BadRequestException("Only jpg and png files are allowed");
        }
    }

    private boolean hasAllowedExtension(String fileName) {
        String lowerCaseName = fileName.toLowerCase();
        return lowerCaseName.endsWith(".jpg") || lowerCaseName.endsWith(".jpeg") || lowerCaseName.endsWith(".png");
    }

    private String forceHttps(String url) {
        if (url == null || url.isBlank()) return url;
        if (url.startsWith("http://")) {
            return "https://" + url.substring("http://".length());
        }
        return url;
    }
}
