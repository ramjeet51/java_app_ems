package com.ems.backend.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private Employee reviewer;

    /** Format: YYYY-QN or YYYY-MM depending on review cycle */
    @Column(name = "review_period", nullable = false, length = 10)
    private String reviewPeriod;

    @Column(nullable = false)
    private LocalDate reviewDate;

    @Column(nullable = false)
    private Integer productivityScore;

    @Column(nullable = false)
    private Integer qualityScore;

    @Column(nullable = false)
    private Integer teamworkScore;

    @Column(nullable = false)
    private Integer communicationScore;

    @Column(precision = 4, scale = 2)
    private java.math.BigDecimal overallRating;

    @Column(length = 1000)
    private String strengths;

    @Column(length = 1000)
    private String areasForImprovement;

    @Column(length = 1000)
    private String goals;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private ReviewStatus status = ReviewStatus.DRAFT;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ReviewStatus {
        DRAFT, SUBMITTED, ACKNOWLEDGED
    }
}
