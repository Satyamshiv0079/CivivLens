package com.civiclens.service;

import com.civiclens.dto.AiCategorizationDto;
import com.civiclens.dto.DuplicateCandidateDto;
import com.civiclens.entity.CivicReport;
import com.civiclens.entity.IssueCategory;
import com.civiclens.entity.ReportStatus;
import com.civiclens.repository.CivicReportRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final CivicReportRepository reportRepository;

    private static final Map<IssueCategory, Set<String>> CATEGORY_KEYWORDS = new EnumMap<>(IssueCategory.class);

    static {
        CATEGORY_KEYWORDS.put(IssueCategory.POTHOLE, new HashSet<>(Arrays.asList(
                "pothole", "crater", "road", "tarmac", "asphalt", "cracked", "bump", "bitumen",
                "manhole", "uneven", "ditch", "skid", "car damage", "tire"
        )));

        CATEGORY_KEYWORDS.put(IssueCategory.GARBAGE, new HashSet<>(Arrays.asList(
                "garbage", "trash", "waste", "dump", "litter", "rubbish", "refuse", "bin",
                "overflow", "stench", "smell", "rotting", "plastic", "debris"
        )));

        CATEGORY_KEYWORDS.put(IssueCategory.BROKEN_STREETLIGHT, new HashSet<>(Arrays.asList(
                "streetlight", "light", "lamp", "dark", "bulb", "pole", "lighting",
                "flicker", "blackout", "fixture", "night", "illumination"
        )));

        CATEGORY_KEYWORDS.put(IssueCategory.WATER_LEAKAGE, new HashSet<>(Arrays.asList(
                "water", "leak", "leaking", "pipe", "burst", "drain", "drainage",
                "sewer", "sewage", "flood", "flooding", "puddle", "contamination"
        )));
    }

    public AiService(CivicReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    /**
     * AI-assisted category prediction from title and description
     */
    public AiCategorizationDto categorize(String title, String description) {
        String combined = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();
        String[] tokens = combined.split("\\W+");

        Map<IssueCategory, Integer> matchScores = new EnumMap<>(IssueCategory.class);
        Map<IssueCategory, List<String>> matchedKeywords = new EnumMap<>(IssueCategory.class);

        for (IssueCategory cat : IssueCategory.values()) {
            matchScores.put(cat, 0);
            matchedKeywords.put(cat, new ArrayList<>());
        }

        for (String token : tokens) {
            if (token.length() < 3) continue;
            for (Map.Entry<IssueCategory, Set<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
                if (entry.getValue().contains(token)) {
                    matchScores.put(entry.getKey(), matchScores.get(entry.getKey()) + 1);
                    if (!matchedKeywords.get(entry.getKey()).contains(token)) {
                        matchedKeywords.get(entry.getKey()).add(token);
                    }
                }
            }
        }

        IssueCategory bestCategory = IssueCategory.OTHER;
        int maxMatches = 0;

        for (Map.Entry<IssueCategory, Integer> entry : matchScores.entrySet()) {
            if (entry.getValue() > maxMatches) {
                maxMatches = entry.getValue();
                bestCategory = entry.getKey();
            }
        }

        if (maxMatches == 0) {
            return new AiCategorizationDto(
                    IssueCategory.OTHER,
                    0.50,
                    "General classification based on submitted description."
            );
        }

        double confidence = Math.min(0.95, 0.60 + (maxMatches * 0.10));
        String explanation = String.format(
                "Detected key civic terms: %s",
                String.join(", ", matchedKeywords.get(bestCategory))
        );

        return new AiCategorizationDto(bestCategory, confidence, explanation);
    }

    /**
     * Detect potential duplicate reports within 250 meters
     */
    public List<DuplicateCandidateDto> detectDuplicates(
            Double latitude,
            Double longitude,
            IssueCategory category,
            String title,
            String description
    ) {
        if (latitude == null || longitude == null || category == null) {
            return Collections.emptyList();
        }

        // Search open reports in same category
        List<CivicReport> candidates = reportRepository.findReportsWithFilters(category, null, null);
        List<DuplicateCandidateDto> duplicates = new ArrayList<>();

        Set<String> queryTokens = tokenize((title != null ? title : "") + " " + (description != null ? description : ""));

        for (CivicReport report : candidates) {
            if (report.getStatus() == ReportStatus.RESOLVED || report.getStatus() == ReportStatus.REJECTED) {
                continue; // Ignore already closed/rejected reports
            }

            double distance = calculateHaversineDistance(
                    latitude, longitude,
                    report.getLatitude(), report.getLongitude()
            );

            // Check if within 250m radius
            if (distance <= 250.0) {
                Set<String> reportTokens = tokenize(report.getTitle() + " " + report.getDescription());
                double textSimilarity = computeJaccardSimilarity(queryTokens, reportTokens);

                // Combined spatial and text similarity score
                double distanceFactor = 1.0 - (distance / 250.0);
                double combinedScore = (distanceFactor * 0.5) + (textSimilarity * 0.5);

                if (combinedScore >= 0.30 || distance <= 50.0) {
                    duplicates.add(new DuplicateCandidateDto(
                            report.getId(),
                            report.getTitle(),
                            report.getStatus(),
                            Math.round(distance),
                            Math.round(combinedScore * 100.0) / 100.0,
                            report.getAddress()
                    ));
                }
            }
        }

        duplicates.sort((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()));
        return duplicates;
    }

    private Set<String> tokenize(String text) {
        return Arrays.stream(text.toLowerCase().split("\\W+"))
                .filter(s -> s.length() > 2)
                .collect(Collectors.toSet());
    }

    private double computeJaccardSimilarity(Set<String> s1, Set<String> s2) {
        if (s1.isEmpty() || s2.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(s1);
        intersection.retainAll(s2);

        Set<String> union = new HashSet<>(s1);
        union.addAll(s2);

        return (double) intersection.size() / union.size();
    }

    /**
     * Haversine formula to compute great-circle distance between coordinates in meters
     */
    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Earth radius in meters
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
