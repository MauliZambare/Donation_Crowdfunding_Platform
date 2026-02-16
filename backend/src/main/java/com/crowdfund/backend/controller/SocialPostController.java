package com.crowdfund.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crowdfund.backend.dto.SocialPostResponse;
import com.crowdfund.backend.service.SocialPostService;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequestMapping("/api/social/posts")
public class SocialPostController {

    private final SocialPostService socialPostService;

    public SocialPostController(SocialPostService socialPostService) {
        this.socialPostService = socialPostService;
    }

    @GetMapping("/{campaignId}")
    public ResponseEntity<SocialPostResponse> getSocialPost(@PathVariable String campaignId) {
        return ResponseEntity.ok(socialPostService.generatePostCaptions(campaignId));
    }
}
