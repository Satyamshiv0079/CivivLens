package com.civiclens.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("app", "CivicLens - Civic Issue Reporting Platform");
        response.put("timestamp", Instant.now().toString());

        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(2);
            response.put("database", valid ? "CONNECTED (" + connection.getMetaData().getDatabaseProductName() + ")" : "UNAVAILABLE");
        } catch (Exception e) {
            response.put("database", "DISCONNECTED: " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}
