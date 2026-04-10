package com.huydidev.humltool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String      id;
    private String      email;
    private String      name;
    private Set<String> roles;   // FE dùng để check isAdmin

    // Constructor cũ — giữ để không break code cũ
    public UserResponse(String id, String email, String name) {
        this.id    = id;
        this.email = email;
        this.name  = name;
    }
}