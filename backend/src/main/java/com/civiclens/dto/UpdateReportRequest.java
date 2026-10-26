package com.civiclens.dto;

import com.civiclens.entity.IssueCategory;
import jakarta.validation.constraints.Size;

public class UpdateReportRequest {

    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @Size(min = 10, max = 4000, message = "Description must be between 10 and 4000 characters")
    private String description;

    private IssueCategory category;

    public UpdateReportRequest() {
    }

    public UpdateReportRequest(String title, String description, IssueCategory category) {
        this.title = title;
        this.description = description;
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public IssueCategory getCategory() {
        return category;
    }

    public void setCategory(IssueCategory category) {
        this.category = category;
    }
}
