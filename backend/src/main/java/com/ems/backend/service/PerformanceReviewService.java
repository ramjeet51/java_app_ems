package com.ems.backend.service;

import com.ems.backend.dto.request.PerformanceReviewRequest;
import com.ems.backend.entity.Employee;
import com.ems.backend.entity.PerformanceReview;
import com.ems.backend.exception.ResourceNotFoundException;
import com.ems.backend.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceReviewService {

    private final PerformanceReviewRepository reviewRepository;
    private final EmployeeService employeeService;
    private final ActivityLogService activityLogService;

    public List<PerformanceReview> getForEmployee(Long employeeId) {
        return reviewRepository.findByEmployeeId(employeeId);
    }

    public List<PerformanceReview> getAll() {
        return reviewRepository.findAll();
    }

    @Transactional
    public PerformanceReview create(PerformanceReviewRequest request) {
        Employee employee = employeeService.findEntity(request.getEmployeeId());
        Employee reviewer = request.getReviewerId() != null ? employeeService.findEntity(request.getReviewerId()) : null;

        BigDecimal overall = average(
                request.getProductivityScore(), request.getQualityScore(),
                request.getTeamworkScore(), request.getCommunicationScore());

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewPeriod(request.getReviewPeriod())
                .reviewDate(request.getReviewDate())
                .productivityScore(request.getProductivityScore())
                .qualityScore(request.getQualityScore())
                .teamworkScore(request.getTeamworkScore())
                .communicationScore(request.getCommunicationScore())
                .overallRating(overall)
                .strengths(request.getStrengths())
                .areasForImprovement(request.getAreasForImprovement())
                .goals(request.getGoals())
                .status(request.getStatus() != null
                        ? PerformanceReview.ReviewStatus.valueOf(request.getStatus())
                        : PerformanceReview.ReviewStatus.DRAFT)
                .build();

        review = reviewRepository.save(review);
        activityLogService.record("PERFORMANCE_REVIEW_CREATED", "PerformanceReview", review.getId(),
                "Created review for " + employee.getFullName() + " (" + request.getReviewPeriod() + ")");
        return review;
    }

    @Transactional
    public PerformanceReview update(Long id, PerformanceReviewRequest request) {
        PerformanceReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Performance review not found: " + id));

        review.setProductivityScore(request.getProductivityScore());
        review.setQualityScore(request.getQualityScore());
        review.setTeamworkScore(request.getTeamworkScore());
        review.setCommunicationScore(request.getCommunicationScore());
        review.setOverallRating(average(
                request.getProductivityScore(), request.getQualityScore(),
                request.getTeamworkScore(), request.getCommunicationScore()));
        review.setStrengths(request.getStrengths());
        review.setAreasForImprovement(request.getAreasForImprovement());
        review.setGoals(request.getGoals());
        if (request.getStatus() != null) {
            review.setStatus(PerformanceReview.ReviewStatus.valueOf(request.getStatus()));
        }

        review = reviewRepository.save(review);
        activityLogService.record("PERFORMANCE_REVIEW_UPDATED", "PerformanceReview", review.getId(), "Review updated");
        return review;
    }

    private BigDecimal average(Integer... scores) {
        double sum = 0;
        int count = 0;
        for (Integer s : scores) {
            if (s != null) { sum += s; count++; }
        }
        if (count == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(sum / count).setScale(2, RoundingMode.HALF_UP);
    }
}
