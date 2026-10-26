package com.civiclens.dto;

import com.civiclens.entity.IssueCategory;

public class AiCategorizationDto {
    private IssueCategory suggestedCategory;
    private double confidence;
    private String explanation;

    public AiCategorizationDto() {
    }

    public AiCategorizationDto(IssueCategory suggestedCategory, double confidence, String explanation) {
        this.suggestedCategory = suggestedCategory;
        this.confidence = confidence;
        this.explanation = explanation;
    }

    public IssueCategory getSuggestedCategory() {
        return suggestedCategory;
    }

    public void setSuggestedCategory(IssueCategory suggestedCategory) {
        this.suggestedCategory = suggestedCategory;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
