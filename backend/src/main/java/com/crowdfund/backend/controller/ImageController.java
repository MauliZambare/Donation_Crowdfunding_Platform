package com.crowdfund.backend.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.crowdfund.backend.service.ImageUploadService;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private static final Logger log = LoggerFactory.getLogger(ImageController.class);

    private final ImageUploadService imageUploadService;

    public ImageController(ImageUploadService imageUploadService) {
        this.imageUploadService = imageUploadService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = imageUploadService.uploadImage(file);
        log.info("Image upload API response imageUrl={}", imageUrl);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }
}
