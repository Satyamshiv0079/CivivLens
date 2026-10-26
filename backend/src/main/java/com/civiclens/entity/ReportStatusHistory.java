package com.civiclens.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "report_status_histories")
public class ReportStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private CivicReport report;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ReportStatus status;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_id")
    private User updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ReportStatusHistory() {
    }

    public ReportStatusHistory(CivicReport report, ReportStatus status, String comment, User updatedBy) {
        this.report = report;
        this.status = status;
        this.comment = comment;
        this.updatedBy = updatedBy;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CivicReport getReport() {
        return report;
    }

    public void setReport(CivicReport report) {
        this.report = report;
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

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
