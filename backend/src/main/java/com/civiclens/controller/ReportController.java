package com.civiclens.controller;

import com.civiclens.dto.*;
import com.civiclens.entity.IssueCategory;
import com.civiclens.entity.ReportStatus;
import com.civiclens.entity.User;
import com.civiclens.repository.UserRepository;
import com.civiclens.security.AiRateLimiter;
import com.civiclens.service.AiService;
import com.civiclens.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;
    private final AiService aiService;
    private final AiRateLimiter aiRateLimiter;

    public ReportController(
            ReportService reportService,
            UserRepository userRepository,
            AiService aiService,
            AiRateLimiter aiRateLimiter
    ) {
        this.reportService = reportService;
        this.userRepository = userRepository;
        this.aiService = aiService;
        this.aiRateLimiter = aiRateLimiter;
    }

    /**
     * Submit report with photo (multipart/form-data)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReportDto> createReportMultipart(
            @RequestPart("data") @Valid CreateReportRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            Authentication authentication
    ) {
        ReportDto report = reportService.createReport(request, photo, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    /**
     * Submit report without photo (application/json)
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ReportDto> createReportJson(
            @Valid @RequestBody CreateReportRequest request,
            Authentication authentication
    ) {
        ReportDto report = reportService.createReport(request, null, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    /**
     * List reports with optional filters (category, status, myReports)
     */
    @GetMapping
    public ResponseEntity<List<ReportDto>> getReports(
            @RequestParam(required = false) IssueCategory category,
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false, defaultValue = "false") boolean myOnly,
            Authentication authentication
    ) {
        Long authorId = null;
        if (myOnly && authentication != null && authentication.isAuthenticated()) {
            User currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
            if (currentUser != null) {
                authorId = currentUser.getId();
            }
        }

        List<ReportDto> reports = reportService.getReports(category, status, authorId);
        return ResponseEntity.ok(reports);
    }

    /**
     * Get report details by ID including status history
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReportDto> getReportById(@PathVariable Long id) {
        ReportDto report = reportService.getReportById(id);
        return ResponseEntity.ok(report);
    }

    /**
     * Edit report details (Citizen owner)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReportDto> updateReport(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReportRequest request,
            Authentication authentication
    ) {
        ReportDto updated = reportService.updateReport(id, request, null, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * Withdraw/delete report (Citizen owner)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable Long id,
            Authentication authentication
    ) {
        reportService.deleteReport(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Update report status and add status history entry (Moderators/Admins)
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ReportDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request,
            Authentication authentication
    ) {
        ReportDto updated = reportService.updateStatus(id, request, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * Get aggregated metrics and report status statistics (Moderator/Admin only)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ReportStatisticsDto> getStatistics() {
        ReportStatisticsDto stats = reportService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * AI-assisted category prediction with request validation and rate limiting
     */
    @PostMapping("/ai-categorize")
    public ResponseEntity<AiCategorizationDto> aiCategorize(
            @Valid @RequestBody(required = false) AiCategorizeRequest request,
            HttpServletRequest httpRequest
    ) {
        aiRateLimiter.checkRateLimit(extractClientIp(httpRequest));

        String title = request != null ? request.getTitle() : "";
        String description = request != null ? request.getDescription() : "";
        AiCategorizationDto result = aiService.categorize(title, description);
        return ResponseEntity.ok(result);
    }

    /**
     * Spatial & semantic duplicate detection with request validation and rate limiting
     */
    @PostMapping("/check-duplicates")
    public ResponseEntity<List<DuplicateCandidateDto>> checkDuplicates(
            @Valid @RequestBody CheckDuplicatesRequest request,
            HttpServletRequest httpRequest
    ) {
        aiRateLimiter.checkRateLimit(extractClientIp(httpRequest));

        List<DuplicateCandidateDto> duplicates = aiService.detectDuplicates(
                request.getLatitude(),
                request.getLongitude(),
                request.getCategory(),
                request.getTitle(),
                request.getDescription()
        );
        return ResponseEntity.ok(duplicates);
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return "anonymous";
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
