package com.civiclens.repository;

import com.civiclens.entity.ReportStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportStatusHistoryRepository extends JpaRepository<ReportStatusHistory, Long> {

    @Query("SELECT h FROM ReportStatusHistory h LEFT JOIN FETCH h.updatedBy WHERE h.report.id = :reportId ORDER BY h.createdAt ASC")
    List<ReportStatusHistory> findByReportIdWithUser(@Param("reportId") Long reportId);
}
