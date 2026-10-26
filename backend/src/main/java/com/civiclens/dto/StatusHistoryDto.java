package com.civiclens.dto;

import com.civiclens.entity.ReportStatus;
import com.civiclens.entity.ReportStatusHistory;

import java.time.Instant;

public class StatusHistoryDto {
    private Long id;
    private ReportStatus status;
    private String comment;
    private String updatedBy;
    private Instant createdAt;

    public StatusHistoryDto() {
    }

    public StatusHistoryDto(Long id, ReportStatus status, String comment, String updatedBy, Instant createdAt) {
        this.id = id;
        this.status = status;
        this.comment = comment;
        this.updatedBy = updatedBy;
        this.createdAt = createdAt;
    }

    public static StatusHistoryDto fromEntity(ReportStatusHistory history) {
        if (history == null) {
            return null;
        }
        String updatedByName = history.getUpdatedBy() != null ? history.getUpdatedBy().getName() : "System";
        return new StatusHistoryDto(
                history.getId(),
                history.getStatus(),
                history.getComment(),
                updatedByName,
                history.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
