package com.ems.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalEmployees;
    private long activeEmployees;
    private long onLeaveToday;
    private long presentToday;
    private long pendingLeaveRequests;
    private Map<String, Long> employeesByDepartment;
    private Map<String, Long> attendanceLast7Days;
    private List<RecentActivityItem> recentActivity;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RecentActivityItem {
        private String action;
        private String actorEmail;
        private String timestamp;
    }
}
