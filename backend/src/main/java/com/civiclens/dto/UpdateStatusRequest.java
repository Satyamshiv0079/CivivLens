package com.civiclens.dto;

import com.civiclens.entity.ReportStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateStatusRequest {

    @NotNull(message = "Status is required")
    private ReportStatus status;

    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    private String comment;

    public UpdateStatusRequest() {
    }

    public UpdateStatusRequest(ReportStatus status, String comment) {
        this.status = status;
        this.comment = comment;
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
}
