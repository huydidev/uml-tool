package com.huydidev.humltool.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShareModel {
    private String userId;
    private String role;
    private String grantedAt;

    private String userName;
}
