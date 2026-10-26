package com.civiclens.dto;

import java.util.Map;

public class ReportStatisticsDto {
    private long totalReports;
    private long submittedReports;
    private long verifiedReports;
    private long inProgressReports;
    private long resolvedReports;
    private long rejectedReports;
    private Map<String, Long> categoryCounts;

    public ReportStatisticsDto() {
    }

    public ReportStatisticsDto(
            long totalReports,
            long submittedReports,
            long verifiedReports,
            long inProgressReports,
            long resolvedReports,
            long rejectedReports,
            Map<String, Long> categoryCounts
    ) {
        this.totalReports = totalReports;
        this.submittedReports = submittedReports;
        this.verifiedReports = verifiedReports;
        this.inProgressReports = inProgressReports;
        this.resolvedReports = resolvedReports;
        this.rejectedReports = rejectedReports;
        this.categoryCounts = categoryCounts;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getSubmittedReports() {
        return submittedReports;
    }

    public void setSubmittedReports(long submittedReports) {
        this.submittedReports = submittedReports;
    }

    public long getVerifiedReports() {
        return verifiedReports;
    }

    public void setVerifiedReports(long verifiedReports) {
        this.verifiedReports = verifiedReports;
    }

    public long getInProgressReports() {
        return inProgressReports;
    }

    public void setInProgressReports(long inProgressReports) {
        this.inProgressReports = inProgressReports;
    }

    public long getResolvedReports() {
        return resolvedReports;
    }

    public void setResolvedReports(long resolvedReports) {
        this.resolvedReports = resolvedReports;
    }

    public long getRejectedReports() {
        return rejectedReports;
    }

    public void setRejectedReports(long rejectedReports) {
        this.rejectedReports = rejectedReports;
    }

    public Map<String, Long> getCategoryCounts() {
        return categoryCounts;
    }

    public void setCategoryCounts(Map<String, Long> categoryCounts) {
        this.categoryCounts = categoryCounts;
    }
}
