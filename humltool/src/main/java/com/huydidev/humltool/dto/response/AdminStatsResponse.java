package com.huydidev.humltool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    // ── Overview ─────────────────────────────────────────────────
    private long totalUsers;
    private long totalDiagrams;
    private long diagramsToday;
    private long newUsersThisWeek;

    // ── Charts — 7 ngày gần nhất ─────────────────────────────────
    private List<DayCount> newUsersLast7Days;
    private List<DayCount> newDiagramsLast7Days;

    // ── Recent ───────────────────────────────────────────────────
    private List<RecentUser>    recentUsers;
    private List<RecentDiagram> recentDiagrams;

    // ── Inner classes ─────────────────────────────────────────────
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DayCount {
        private String date;   // "2026-04-01"
        private long   count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentUser {
        private String id;
        private String name;
        private String email;
        private String createdAt;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentDiagram {
        private String id;
        private String title;
        private String ownerId;
        private String updatedAt;
    }
}