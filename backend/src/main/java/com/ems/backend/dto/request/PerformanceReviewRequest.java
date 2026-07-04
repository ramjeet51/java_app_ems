package com.ems.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PerformanceReviewRequest {
    @NotNull
    private Long employeeId;

    private Long reviewerId;

    @NotBlank
    private String reviewPeriod;

    @NotNull
    private LocalDate reviewDate;

    @Min(1) @Max(10)
    private Integer productivityScore;

    @Min(1) @Max(10)
    private Integer qualityScore;

    @Min(1) @Max(10)
    private Integer teamworkScore;

    @Min(1) @Max(10)
    private Integer communicationScore;

    private String strengths;
    private String areasForImprovement;
    private String goals;
    private String status; // DRAFT, SUBMITTED, ACKNOWLEDGED
}
