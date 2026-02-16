package com.crowdfund.backend.dto;

public class SocialPostResponse {

    private String instagram;
    private String twitter;
    private String whatsapp;

    public SocialPostResponse() {
    }

    public SocialPostResponse(String instagram, String twitter, String whatsapp) {
        this.instagram = instagram;
        this.twitter = twitter;
        this.whatsapp = whatsapp;
    }

    public String getInstagram() {
        return instagram;
    }

    public void setInstagram(String instagram) {
        this.instagram = instagram;
    }

    public String getTwitter() {
        return twitter;
    }

    public void setTwitter(String twitter) {
        this.twitter = twitter;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
    }
}
