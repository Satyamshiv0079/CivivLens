package com.civiclens.repository;

import com.civiclens.entity.CivicReport;
import com.civiclens.entity.IssueCategory;
import com.civiclens.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CivicReportRepository extends JpaRepository<CivicReport, Long> {

    @Query("SELECT r FROM CivicReport r JOIN FETCH r.author " +
           "WHERE (:category IS NULL OR r.category = :category) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:authorId IS NULL OR r.author.id = :authorId) " +
           "ORDER BY r.createdAt DESC")
    List<CivicReport> findReportsWithFilters(
            @Param("category") IssueCategory category,
            @Param("status") ReportStatus status,
            @Param("authorId") Long authorId
    );

    List<CivicReport> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    long countByStatus(ReportStatus status);

    long countByCategory(IssueCategory category);
}
