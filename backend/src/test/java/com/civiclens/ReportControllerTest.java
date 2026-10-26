package com.civiclens;

import com.civiclens.dto.CreateReportRequest;
import com.civiclens.dto.ReportDto;
import com.civiclens.dto.UpdateStatusRequest;
import com.civiclens.entity.IssueCategory;
import com.civiclens.entity.ReportStatus;
import com.civiclens.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    @Test
    void getReports_PublicAccess_Returns200() throws Exception {
        when(reportService.getReports(any(), any(), any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/reports"))
                .andExpect(status().isOk());
    }

    @Test
    void getReportById_PublicAccess_Returns200() throws Exception {
        ReportDto dto = new ReportDto();
        dto.setId(10L);
        dto.setTitle("Streetlight Broken");
        dto.setCategory(IssueCategory.BROKEN_STREETLIGHT);
        dto.setStatus(ReportStatus.SUBMITTED);
        dto.setCreatedAt(Instant.now());

        when(reportService.getReportById(10L)).thenReturn(dto);

        mockMvc.perform(get("/api/reports/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("Streetlight Broken"));
    }

    @Test
    @WithMockUser(username = "citizen@example.com", roles = {"CITIZEN"})
    void createReport_AuthenticatedCitizen_Returns201() throws Exception {
        ReportDto dto = new ReportDto();
        dto.setId(20L);
        dto.setTitle("Huge pothole near junction");
        dto.setStatus(ReportStatus.SUBMITTED);
        dto.setCategory(IssueCategory.POTHOLE);

        when(reportService.createReport(any(CreateReportRequest.class), any(), eq("citizen@example.com")))
                .thenReturn(dto);

        String jsonPayload = """
                {
                    "title": "Huge pothole near junction",
                    "description": "Vehicle axle damaged due to deep pothole on road.",
                    "category": "POTHOLE",
                    "latitude": 12.9716,
                    "longitude": 77.5946,
                    "address": "MG Road"
                }
                """;

        mockMvc.perform(post("/api/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.title").value("Huge pothole near junction"));
    }

    @Test
    @WithMockUser(username = "citizen@example.com", roles = {"CITIZEN"})
    void updateStatus_CitizenRole_Forbidden403() throws Exception {
        String jsonPayload = """
                {
                    "status": "VERIFIED",
                    "comment": "Illegal update by citizen"
                }
                """;

        mockMvc.perform(patch("/api/reports/10/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "moderator@civiclens.gov", roles = {"MODERATOR"})
    void updateStatus_ModeratorRole_Returns200() throws Exception {
        ReportDto dto = new ReportDto();
        dto.setId(10L);
        dto.setStatus(ReportStatus.VERIFIED);

        when(reportService.updateStatus(eq(10L), any(UpdateStatusRequest.class), eq("moderator@civiclens.gov")))
                .thenReturn(dto);

        String jsonPayload = """
                {
                    "status": "VERIFIED",
                    "comment": "Site inspected and verified"
                }
                """;

        mockMvc.perform(patch("/api/reports/10/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("VERIFIED"));
    }
}
