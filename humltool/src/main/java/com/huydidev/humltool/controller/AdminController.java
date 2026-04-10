package com.huydidev.humltool.controller;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.dto.response.AdminStatsResponse;
import com.huydidev.humltool.entity.UserEntity;
import com.huydidev.humltool.repository.UserRepository;
import com.huydidev.humltool.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private AdminService    adminService;
    @Autowired private JwtUtils        jwtUtils;
    @Autowired private UserRepository  userRepository;

    // GET /api/admin/stats — chỉ ROLE_ADMIN mới vào được
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(
            @RequestHeader("Authorization") String authHeader
    ) {
        // Check role admin
        if (!isAdmin(authHeader.substring(7))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Bạn không có quyền truy cập"));
        }
        return ResponseEntity.ok(adminService.getStats());
    }

    // ── Helper check admin ────────────────────────────────────────
    private boolean isAdmin(String token) {
        try {
            String email = jwtUtils.getUserNameFromJwtToken(token);
            return userRepository.findByEmail(email)
                    .map(u -> u.getRoles() != null && u.getRoles().contains("ROLE_ADMIN"))
                    .orElse(false);
        } catch (Exception e) {
            return false;
        }
    }
}