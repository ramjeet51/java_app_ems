package com.ems.backend.service;

import com.ems.backend.dto.response.DashboardSummaryResponse;
import com.ems.backend.entity.ActivityLog;
import com.ems.backend.entity.Attendance;
import com.ems.backend.entity.Employee;
import com.ems.backend.entity.Leave;
import com.ems.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Aggregates cross-module data for the reports/dashboard screen.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardSummaryResponse getDashboardSummary() {
        List<Employee> allEmployees = employeeRepository.findAll();
        long totalEmployees = allEmployees.size();
        long activeEmployees = employeeRepository.countByStatus(Employee.EmploymentStatus.ACTIVE);

        LocalDate today = LocalDate.now();
        List<Attendance> todayAttendance = attendanceRepository.findByAttendanceDate(today);
        long presentToday = todayAttendance.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT
                        || a.getStatus() == Attendance.AttendanceStatus.WORK_FROM_HOME)
                .count();
        long onLeaveToday = todayAttendance.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.ON_LEAVE)
                .count();

        long pendingLeaves = leaveRepository.findByStatus(Leave.LeaveStatus.PENDING).size();

        Map<String, Long> byDepartment = allEmployees.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getDepartment() == null ? "Unassigned" : e.getDepartment(),
                        Collectors.counting()));

        Map<String, Long> last7Days = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM-dd");
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            long count = attendanceRepository.findByAttendanceDate(day).stream()
                    .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT
                            || a.getStatus() == Attendance.AttendanceStatus.WORK_FROM_HOME)
                    .count();
            last7Days.put(day.format(fmt), count);
        }

        List<DashboardSummaryResponse.RecentActivityItem> recent = activityLogRepository
                .findAllByOrderByTimestampDesc(PageRequest.of(0, 10))
                .stream()
                .map(this::toActivityItem)
                .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .onLeaveToday(onLeaveToday)
                .presentToday(presentToday)
                .pendingLeaveRequests(pendingLeaves)
                .employeesByDepartment(byDepartment)
                .attendanceLast7Days(last7Days)
                .recentActivity(recent)
                .build();
    }

    private DashboardSummaryResponse.RecentActivityItem toActivityItem(ActivityLog log) {
        return DashboardSummaryResponse.RecentActivityItem.builder()
                .action(log.getAction())
                .actorEmail(log.getActorEmail())
                .timestamp(log.getTimestamp().toString())
                .build();
    }
}
