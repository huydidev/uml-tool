package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.dto.request.UpdatePasswordRequest;
import com.huydidev.humltool.dto.request.UpdateProfileRequest;
import com.huydidev.humltool.dto.response.UserResponse;
import com.huydidev.humltool.entity.UserEntity;
import com.huydidev.humltool.exceptions.ResourceNotFoundException;
import com.huydidev.humltool.repository.UserRepository;
import com.huydidev.humltool.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    @Autowired private UserRepository   userRepository;
    @Autowired private JwtUtils         jwtUtils;
    @Autowired private PasswordEncoder  passwordEncoder;

    @Override
    public UserResponse getMe(String token) {
        UserEntity user = findUserByToken(token);
        return toResponse(user);
    }

    @Override
    public UserResponse updateProfile(String token, UpdateProfileRequest request) {
        UserEntity user = findUserByToken(token);
        user.setName(request.getName());
        user.setUpdatedAt(LocalDateTime.now());
        return toResponse(userRepository.save(user));
    }

    @Override
    public void updatePassword(String token, UpdatePasswordRequest request) {
        UserEntity user = findUserByToken(token);

        // Verify mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác");
        }

        // Không cho đặt mật khẩu mới giống cũ
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu mới không được giống mật khẩu cũ");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private UserEntity findUserByToken(String token) {
        String email = jwtUtils.getUserNameFromJwtToken(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
    }

    private UserResponse toResponse(UserEntity user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getRoles());
    }
}