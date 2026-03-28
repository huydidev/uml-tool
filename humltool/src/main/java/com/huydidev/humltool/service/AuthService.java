package com.huydidev.humltool.service;

import com.huydidev.humltool.dto.JwtResponse;
import com.huydidev.humltool.dto.LoginRequest;
import com.huydidev.humltool.dto.RegisterRequest;
import com.huydidev.humltool.dto.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);

    JwtResponse login(LoginRequest request);

    void logout(String token);
}
