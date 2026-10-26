package com.civiclens.controller;

import com.civiclens.dto.*;
import com.civiclens.entity.IssueCategory;
import com.civiclens.entity.ReportStatus;
import com.civiclens.entity.User;
import com.civiclens.repository.UserRepository;
import com.civiclens.service.AiService;
import com.civiclens.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;
    private final AiService aiService;

    public ReportController(
            ReportService reportService,
            UserRepository userRepository,
            AiService aiService
    ) {
        this.reportService = reportService;
        this.userRepository = userRepository;
        this.aiService = aiService;
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
     * Get aggregated metrics and report status statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ReportStatisticsDto> getStatistics() {
        ReportStatisticsDto stats = reportService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Stage 7 Enhancement: AI-assisted category prediction from title & description
     */
    @PostMapping("/ai-categorize")
    public ResponseEntity<AiCategorizationDto> aiCategorize(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String description = payload.get("description");
        AiCategorizationDto result = aiService.categorize(title, description);
        return ResponseEntity.ok(result);
    }

    /**
     * Stage 7 Enhancement: Spatial & semantic duplicate detection
     */
    @PostMapping("/check-duplicates")
    public ResponseEntity<List<DuplicateCandidateDto>> checkDuplicates(@RequestBody Map<String, Object> payload) {
        Double lat = payload.get("latitude") != null ? Double.valueOf(payload.get("latitude").toString()) : null;
        Double lng = payload.get("longitude") != null ? Double.valueOf(payload.get("longitude").toString()) : null;
        String catStr = payload.get("category") != null ? payload.get("category").toString() : null;
        IssueCategory category = catStr != null ? IssueCategory.valueOf(catStr) : null;
        String title = payload.get("title") != null ? payload.get("title").toString() : "";
        String description = payload.get("description") != null ? payload.get("description").toString() : "";

        List<DuplicateCandidateDto> duplicates = aiService.detectDuplicates(lat, lng, category, title, description);
        return ResponseEntity.ok(duplicates);
    }
}
