package com.ems.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeaveReviewRequest {
    @NotNull
    private String decision; // APPROVED or REJECTED

    private Long reviewerEmployeeId;

    private String comment;
}
