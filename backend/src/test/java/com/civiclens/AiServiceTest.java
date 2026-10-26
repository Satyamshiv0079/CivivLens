package com.civiclens;

import com.civiclens.dto.AiCategorizationDto;
import com.civiclens.dto.DuplicateCandidateDto;
import com.civiclens.entity.CivicReport;
import com.civiclens.entity.IssueCategory;
import com.civiclens.entity.ReportStatus;
import com.civiclens.entity.User;
import com.civiclens.repository.CivicReportRepository;
import com.civiclens.service.AiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiServiceTest {

    @Mock
    private CivicReportRepository reportRepository;

    @InjectMocks
    private AiService aiService;

    @Test
    void categorize_PotholeKeywords_ReturnsPotholeCategory() {
        AiCategorizationDto result = aiService.categorize(
                "Massive pothole on road",
                "Deep crater in asphalt causing dangerous tire damage"
        );

        assertNotNull(result);
        assertEquals(IssueCategory.POTHOLE, result.getSuggestedCategory());
        assertTrue(result.getConfidence() >= 0.70);
        assertTrue(result.getExplanation().contains("pothole"));
    }

    @Test
    void categorize_GarbageKeywords_ReturnsGarbageCategory() {
        AiCategorizationDto result = aiService.categorize(
                "Rotting waste near park",
                "Garbage dump overflowing with plastic trash and terrible stench"
        );

        assertNotNull(result);
        assertEquals(IssueCategory.GARBAGE, result.getSuggestedCategory());
    }

    @Test
    void categorize_StreetlightKeywords_ReturnsStreetlightCategory() {
        AiCategorizationDto result = aiService.categorize(
                "Dark junction at night",
                "The street light bulb is broken and pole wire is loose"
        );

        assertNotNull(result);
        assertEquals(IssueCategory.BROKEN_STREETLIGHT, result.getSuggestedCategory());
    }

    @Test
    void categorize_WaterLeakageKeywords_ReturnsWaterLeakageCategory() {
        AiCategorizationDto result = aiService.categorize(
                "Main line burst",
                "Fresh drinking water leaking and flooding the residential street"
        );

        assertNotNull(result);
        assertEquals(IssueCategory.WATER_LEAKAGE, result.getSuggestedCategory());
    }

    @Test
    void detectDuplicates_NearbySimilarReport_ReturnsCandidate() {
        User author = new User();
        author.setId(1L);

        CivicReport existing = new CivicReport(
                "Hazardous pothole on 100ft road",
                "Deep pothole in asphalt near crossroad",
                IssueCategory.POTHOLE,
                12.9716,
                77.5946,
                "100ft Road",
                author,
                null
        );
        existing.setId(55L);
        existing.setStatus(ReportStatus.SUBMITTED);

        when(reportRepository.findReportsWithFilters(any(), any(), any()))
                .thenReturn(Collections.singletonList(existing));

        // Coordinates ~30 meters away with matching title
        List<DuplicateCandidateDto> duplicates = aiService.detectDuplicates(
                12.9718,
                77.5948,
                IssueCategory.POTHOLE,
                "Big pothole on 100ft road",
                "Asphalt damage on road"
        );

        assertNotNull(duplicates);
        assertFalse(duplicates.isEmpty());
        assertEquals(55L, duplicates.get(0).getId());
        assertTrue(duplicates.get(0).getDistanceMeters() < 100);
    }
}
