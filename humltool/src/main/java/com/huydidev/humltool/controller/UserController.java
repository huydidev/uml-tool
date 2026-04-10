package com.huydidev.humltool.controller;

import com.huydidev.humltool.dto.request.UpdatePasswordRequest;
import com.huydidev.humltool.dto.request.UpdateProfileRequest;
import com.huydidev.humltool.dto.response.UserResponse;
import com.huydidev.humltool.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired private UserService userService;

    // Lấy thông tin user đang login
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(userService.getMe(authHeader.substring(7)));
    }

    // Đổi tên hiển thị
    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody @Valid UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(authHeader.substring(7), request));
    }

    // Đổi mật khẩu
    @PatchMapping("/me/password")
    public ResponseEntity<?> updatePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody @Valid UpdatePasswordRequest request
    ) {
        userService.updatePassword(authHeader.substring(7), request);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }
}