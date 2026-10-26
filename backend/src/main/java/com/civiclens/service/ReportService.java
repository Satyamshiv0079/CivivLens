package com.civiclens.service;

import com.civiclens.dto.*;
import com.civiclens.entity.*;
import com.civiclens.repository.CivicReportRepository;
import com.civiclens.repository.ReportStatusHistoryRepository;
import com.civiclens.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final CivicReportRepository reportRepository;
    private final ReportStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ReportService(
            CivicReportRepository reportRepository,
            ReportStatusHistoryRepository historyRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService
    ) {
        this.reportRepository = reportRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ReportDto createReport(CreateReportRequest request, MultipartFile photo, String userEmail) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        String imageUrl = null;
        if (photo != null && !photo.isEmpty()) {
            imageUrl = fileStorageService.storeFile(photo);
        }

        CivicReport report = new CivicReport(
                request.getTitle().trim(),
                request.getDescription().trim(),
                request.getCategory(),
                request.getLatitude(),
                request.getLongitude(),
                request.getAddress() != null ? request.getAddress().trim() : null,
                author,
                imageUrl
        );

        // Initial status history entry
        ReportStatusHistory initialHistory = new ReportStatusHistory(
                report,
                ReportStatus.SUBMITTED,
                "Report submitted by citizen",
                author
        );
        report.addStatusHistory(initialHistory);

        CivicReport savedReport = reportRepository.save(report);
        return ReportDto.fromEntity(savedReport);
    }

    @Transactional(readOnly = true)
    public List<ReportDto> getReports(IssueCategory category, ReportStatus status, Long authorId) {
        List<CivicReport> reports = reportRepository.findReportsWithFilters(category, status, authorId);
        return reports.stream()
                .map(ReportDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReportDto getReportById(Long id) {
        CivicReport report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + id));

        // Ensure status history is fetched
        List<ReportStatusHistory> histories = historyRepository.findByReportIdWithUser(id);
        report.setStatusHistories(histories);

        return ReportDto.fromEntity(report);
    }

    @Transactional
    public ReportDto updateReport(Long id, UpdateReportRequest request, MultipartFile photo, String userEmail) {
        CivicReport report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + id));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        // Ownership and Role Check
        boolean isOwner = report.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to edit this report.");
        }

        // Only allow edits when report is still in SUBMITTED state
        if (report.getStatus() != ReportStatus.SUBMITTED && !isAdmin) {
            throw new IllegalStateException("Only reports in SUBMITTED status can be edited.");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            report.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            report.setDescription(request.getDescription().trim());
        }
        if (request.getCategory() != null) {
            report.setCategory(request.getCategory());
        }
        if (photo != null && !photo.isEmpty()) {
            String newImageUrl = fileStorageService.storeFile(photo);
            report.setImageUrl(newImageUrl);
        }

        CivicReport updatedReport = reportRepository.save(report);
        return ReportDto.fromEntity(updatedReport);
    }

    @Transactional
    public void deleteReport(Long id, String userEmail) {
        CivicReport report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + id));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        boolean isOwner = report.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to withdraw this report.");
        }

        if (report.getStatus() != ReportStatus.SUBMITTED && !isAdmin) {
            throw new IllegalStateException("Reports currently in progress or resolved cannot be withdrawn.");
        }

        reportRepository.delete(report);
    }

    @Transactional
    public ReportDto updateStatus(Long id, UpdateStatusRequest request, String moderatorEmail) {
        CivicReport report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + id));

        User moderator = userRepository.findByEmail(moderatorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + moderatorEmail));

        report.setStatus(request.getStatus());

        String comment = request.getComment();
        if (comment == null || comment.isBlank()) {
            comment = "Status changed to " + request.getStatus();
        }

        ReportStatusHistory history = new ReportStatusHistory(
                report,
                request.getStatus(),
                comment.trim(),
                moderator
        );
        report.addStatusHistory(history);

        CivicReport savedReport = reportRepository.save(report);
        return ReportDto.fromEntity(savedReport);
    }

    @Transactional(readOnly = true)
    public ReportStatisticsDto getStatistics() {
        long total = reportRepository.count();
        long submitted = reportRepository.countByStatus(ReportStatus.SUBMITTED);
        long verified = reportRepository.countByStatus(ReportStatus.VERIFIED);
        long inProgress = reportRepository.countByStatus(ReportStatus.IN_PROGRESS);
        long resolved = reportRepository.countByStatus(ReportStatus.RESOLVED);
        long rejected = reportRepository.countByStatus(ReportStatus.REJECTED);

        Map<String, Long> categoryCounts = new HashMap<>();
        for (IssueCategory cat : IssueCategory.values()) {
            categoryCounts.put(cat.name(), reportRepository.countByCategory(cat));
        }

        return new ReportStatisticsDto(
                total,
                submitted,
                verified,
                inProgress,
                resolved,
                rejected,
                categoryCounts
        );
    }
}
