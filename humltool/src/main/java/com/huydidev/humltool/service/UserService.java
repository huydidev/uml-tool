package com.huydidev.humltool.service;

import com.huydidev.humltool.dto.request.UpdatePasswordRequest;
import com.huydidev.humltool.dto.request.UpdateProfileRequest;
import com.huydidev.humltool.dto.response.UserResponse;

public interface UserService {
    UserResponse getMe(String token);
    UserResponse updateProfile(String token, UpdateProfileRequest request);
    void updatePassword(String token, UpdatePasswordRequest request);
}