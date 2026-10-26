package com.civiclens.dto;

import com.civiclens.entity.CivicReport;
import com.civiclens.entity.IssueCategory;
import com.civiclens.entity.ReportStatus;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ReportDto {
    private Long id;
    private String title;
    private String description;
    private IssueCategory category;
    private ReportStatus status;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private String address;
    private Long authorId;
    private String authorName;
    private Instant createdAt;
    private Instant updatedAt;
    private List<StatusHistoryDto> statusHistory;

    public ReportDto() {
    }

    public static ReportDto fromEntity(CivicReport report) {
        if (report == null) {
            return null;
        }

        ReportDto dto = new ReportDto();
        dto.setId(report.getId());
        dto.setTitle(report.getTitle());
        dto.setDescription(report.getDescription());
        dto.setCategory(report.getCategory());
        dto.setStatus(report.getStatus());
        dto.setImageUrl(report.getImageUrl());
        dto.setLatitude(report.getLatitude());
        dto.setLongitude(report.getLongitude());
        dto.setAddress(report.getAddress());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());

        if (report.getAuthor() != null) {
            dto.setAuthorId(report.getAuthor().getId());
            dto.setAuthorName(report.getAuthor().getName());
        }

        if (report.getStatusHistories() != null) {
            dto.setStatusHistory(
                    report.getStatusHistories().stream()
                            .map(StatusHistoryDto::fromEntity)
                            .collect(Collectors.toList())
            );
        } else {
            dto.setStatusHistory(Collections.emptyList());
        }

        return dto;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public IssueCategory getCategory() {
        return category;
    }

    public void setCategory(IssueCategory category) {
        this.category = category;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<StatusHistoryDto> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<StatusHistoryDto> statusHistory) {
        this.statusHistory = statusHistory;
    }
}
