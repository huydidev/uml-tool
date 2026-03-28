package com.huydidev.humltool.service;

import com.huydidev.humltool.dto.response.JwtResponse;
import com.huydidev.humltool.dto.request.LoginRequest;
import com.huydidev.humltool.dto.request.RegisterRequest;
import com.huydidev.humltool.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);

    JwtResponse login(LoginRequest request);

    void logout(String token);
}
