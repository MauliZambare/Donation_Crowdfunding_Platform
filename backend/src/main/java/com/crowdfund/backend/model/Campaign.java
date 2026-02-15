package com.crowdfund.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "campaigns")
public class Campaign {

    @Id
    private String id;
    private String title;
    private String description;
    private double targetAmount;
    private double raisedAmount;
    private Date deadline;
    private String creatorId; // user id
    private String imageUrl;
    private String status; // active / closed
    private Date createdAt = new Date();

    // Constructors
    public Campaign() {}

    public Campaign(String title, String description, double targetAmount, Date deadline, String creatorId, String imageUrl) {
        this.title = title;
        this.description = description;
        this.targetAmount = targetAmount;
        this.raisedAmount = 0;
        this.deadline = deadline;
        this.creatorId = creatorId;
        this.imageUrl = imageUrl;
        this.status = "active";
        this.createdAt = new Date();
    }

    // Getters & Setters
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public double getTargetAmount() {
        return targetAmount;
    }
    public void setTargetAmount(double targetAmount) {
        this.targetAmount = targetAmount;
    }

    public double getRaisedAmount() {
        return raisedAmount;
    }
    public void setRaisedAmount(double raisedAmount) {
        this.raisedAmount = raisedAmount;
    }

    public Date getDeadline() {
        return deadline;
    }
    public void setDeadline(Date deadline) {
        this.deadline = deadline;
    }

    public String getCreatorId() {
        return creatorId;
    }
    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    public String getImageUrl() {
        return imageUrl;
    }
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
