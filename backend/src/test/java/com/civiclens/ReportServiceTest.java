package com.civiclens;

import com.civiclens.dto.CreateReportRequest;
import com.civiclens.dto.ReportDto;
import com.civiclens.dto.UpdateReportRequest;
import com.civiclens.dto.UpdateStatusRequest;
import com.civiclens.entity.*;
import com.civiclens.repository.CivicReportRepository;
import com.civiclens.repository.ReportStatusHistoryRepository;
import com.civiclens.repository.UserRepository;
import com.civiclens.service.FileStorageService;
import com.civiclens.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private CivicReportRepository reportRepository;

    @Mock
    private ReportStatusHistoryRepository historyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ReportService reportService;

    private User author;
    private User moderator;
    private CivicReport report;

    @BeforeEach
    void setUp() {
        author = new User("Jane Citizen", "citizen@example.com", "pass", Role.CITIZEN);
        author.setId(1L);

        moderator = new User("City Moderator", "moderator@civiclens.gov", "pass", Role.MODERATOR);
        moderator.setId(2L);

        report = new CivicReport(
                "Large Pothole on Main St",
                "Dangerous deep pothole near crosswalk",
                IssueCategory.POTHOLE,
                12.9716,
                77.5946,
                "Main St, City Center",
                author,
                null
        );
        report.setId(100L);
    }

    @Test
    void createReport_Success() {
        CreateReportRequest req = new CreateReportRequest(
                "Large Pothole on Main St",
                "Dangerous deep pothole near crosswalk",
                IssueCategory.POTHOLE,
                12.9716,
                77.5946,
                "Main St, City Center"
        );

        when(userRepository.findByEmail("citizen@example.com")).thenReturn(Optional.of(author));
        when(reportRepository.save(any(CivicReport.class))).thenAnswer(invocation -> {
            CivicReport saved = invocation.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        ReportDto result = reportService.createReport(req, null, "citizen@example.com");

        assertNotNull(result);
        assertEquals("Large Pothole on Main St", result.getTitle());
        assertEquals(ReportStatus.SUBMITTED, result.getStatus());
        assertEquals(author.getId(), result.getAuthorId());
        verify(reportRepository).save(any(CivicReport.class));
    }

    @Test
    void updateReport_OwnerCanEditSubmittedReport() {
        UpdateReportRequest updateReq = new UpdateReportRequest(
                "Updated Pothole Title",
                "Updated description with more details",
                IssueCategory.POTHOLE
        );

        when(reportRepository.findById(100L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail("citizen@example.com")).thenReturn(Optional.of(author));
        when(reportRepository.save(any(CivicReport.class))).thenReturn(report);

        ReportDto updated = reportService.updateReport(100L, updateReq, null, "citizen@example.com");

        assertNotNull(updated);
        assertEquals("Updated Pothole Title", report.getTitle());
    }

    @Test
    void updateReport_NonOwner_ThrowsAccessDenied() {
        User otherCitizen = new User("Bob", "bob@example.com", "pass", Role.CITIZEN);
        otherCitizen.setId(99L);

        UpdateReportRequest updateReq = new UpdateReportRequest("Hacked Title", "Hacked Desc", IssueCategory.POTHOLE);

        when(reportRepository.findById(100L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(otherCitizen));

        assertThrows(AccessDeniedException.class, () ->
                reportService.updateReport(100L, updateReq, null, "bob@example.com")
        );
    }

    @Test
    void updateStatus_ModeratorCanTransitionStatus() {
        UpdateStatusRequest statusReq = new UpdateStatusRequest(ReportStatus.IN_PROGRESS, "Maintenance crew dispatched");

        when(reportRepository.findById(100L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail("moderator@civiclens.gov")).thenReturn(Optional.of(moderator));
        when(reportRepository.save(any(CivicReport.class))).thenReturn(report);

        ReportDto result = reportService.updateStatus(100L, statusReq, "moderator@civiclens.gov");

        assertNotNull(result);
        assertEquals(ReportStatus.IN_PROGRESS, report.getStatus());
        assertEquals(1, report.getStatusHistories().size());
        assertEquals("Maintenance crew dispatched", report.getStatusHistories().get(0).getComment());
    }
}
