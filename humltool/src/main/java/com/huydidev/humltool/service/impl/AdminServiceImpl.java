package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.dto.response.AdminStatsResponse;
import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.entity.UserEntity;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.repository.UserRepository;
import com.huydidev.humltool.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired private UserRepository    userRepository;
    @Autowired private DiagramRepository diagramRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public AdminStatsResponse getStats() {
        LocalDateTime now       = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime weekStart  = now.minusDays(7);

        List<UserEntity>    allUsers    = userRepository.findAll();
        List<DiagramEntity> allDiagrams = diagramRepository.findAll();

        // ── Overview ──────────────────────────────────────────────────
        long totalUsers    = allUsers.size();
        long totalDiagrams = allDiagrams.size();

        long diagramsToday = allDiagrams.stream()
                .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().isAfter(todayStart))
                .count();

        long newUsersThisWeek = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(weekStart))
                .count();

        // ── Chart: new users last 7 days ──────────────────────────────
        List<AdminStatsResponse.DayCount> newUsersLast7Days =
                buildDayCounts(allUsers.stream()
                        .map(UserEntity::getCreatedAt)
                        .filter(d -> d != null && d.isAfter(weekStart))
                        .collect(Collectors.toList()));

        // ── Chart: new diagrams last 7 days ───────────────────────────
        List<AdminStatsResponse.DayCount> newDiagramsLast7Days =
                buildDayCounts(allDiagrams.stream()
                        .map(DiagramEntity::getCreatedAt)
                        .filter(d -> d != null && d.isAfter(weekStart))
                        .collect(Collectors.toList()));

        // ── Recent users — 5 người đăng ký gần nhất ──────────────────
        List<AdminStatsResponse.RecentUser> recentUsers = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(u -> new AdminStatsResponse.RecentUser(
                        u.getId(), u.getName(), u.getEmail(),
                        u.getCreatedAt().format(DATE_FMT)
                ))
                .toList();

        // ── Recent diagrams — 5 diagram cập nhật gần nhất ────────────
        List<AdminStatsResponse.RecentDiagram> recentDiagrams = allDiagrams.stream()
                .filter(d -> d.getUpdatedAt() != null)
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .limit(5)
                .map(d -> new AdminStatsResponse.RecentDiagram(
                        d.getId(), d.getTitle(), d.getOwnerId(),
                        d.getUpdatedAt().format(DATE_FMT)
                ))
                .toList();

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalDiagrams(totalDiagrams)
                .diagramsToday(diagramsToday)
                .newUsersThisWeek(newUsersThisWeek)
                .newUsersLast7Days(newUsersLast7Days)
                .newDiagramsLast7Days(newDiagramsLast7Days)
                .recentUsers(recentUsers)
                .recentDiagrams(recentDiagrams)
                .build();
    }

    // ── Build dayCounts từ list timestamps ────────────────────────────
    // Group theo ngày, fill đủ 7 ngày kể cả ngày không có data
    private List<AdminStatsResponse.DayCount> buildDayCounts(List<LocalDateTime> timestamps) {
        Map<String, Long> grouped = timestamps.stream()
                .collect(Collectors.groupingBy(
                        dt -> dt.toLocalDate().format(DATE_FMT),
                        Collectors.counting()
                ));

        List<AdminStatsResponse.DayCount> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            String date  = LocalDate.now().minusDays(i).format(DATE_FMT);
            long   count = grouped.getOrDefault(date, 0L);
            result.add(new AdminStatsResponse.DayCount(date, count));
        }
        return result;
    }
}