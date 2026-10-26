package com.civiclens.dto;

import com.civiclens.entity.ReportStatus;

public class DuplicateCandidateDto {
    private Long id;
    private String title;
    private ReportStatus status;
    private double distanceMeters;
    private double similarityScore;
    private String address;

    public DuplicateCandidateDto() {
    }

    public DuplicateCandidateDto(
            Long id,
            String title,
            ReportStatus status,
            double distanceMeters,
            double similarityScore,
            String address
    ) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.distanceMeters = distanceMeters;
        this.similarityScore = similarityScore;
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public double getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(double distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    public double getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(double similarityScore) {
        this.similarityScore = similarityScore;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
