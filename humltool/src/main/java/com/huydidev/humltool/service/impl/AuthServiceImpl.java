package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.dto.response.JwtResponse;
import com.huydidev.humltool.dto.request.LoginRequest;
import com.huydidev.humltool.dto.request.RegisterRequest;
import com.huydidev.humltool.dto.response.UserResponse;
import com.huydidev.humltool.entity.UserEntity;
import com.huydidev.humltool.repository.UserRepository;
import com.huydidev.humltool.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired private UserRepository      userRepository;
    @Autowired private PasswordEncoder     passwordEncoder;
    @Autowired private JwtUtils            jwtUtils;
    @Autowired private StringRedisTemplate redisTemplate;

    @Override
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.getEmail());
        user.setName(request.getName() != null
                ? request.getName()
                : request.getEmail().split("@")[0]);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        UserEntity saved = userRepository.save(user);
        return toResponse(saved);
    }

    @Override
    public JwtResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu không chính xác");
        }

        String token = jwtUtils.generateToken(user);
        return new JwtResponse(token, toResponse(user));
    }

    @Override
    public void logout(String token) {
        long ttl = jwtUtils.getExpirationFromToken(token);
        if (ttl > 0) {
            redisTemplate.opsForValue().set(
                    "blacklist:" + token, "revoked", Duration.ofMillis(ttl));
        }
    }

    // ── Helper: trả về UserResponse kèm roles ────────────────────────
    // FE dùng roles để check isAdmin và hiện/ẩn Admin Dashboard link
    private UserResponse toResponse(UserEntity user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRoles()
        );
    }
}