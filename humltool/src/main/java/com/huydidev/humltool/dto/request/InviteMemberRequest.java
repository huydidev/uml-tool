// src/main/java/com/huydidev/humltool/dto/request/InviteMemberRequest.java

package com.huydidev.humltool.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class InviteMemberRequest {

    // Single hoặc bulk — FE gửi list
    @NotEmpty(message = "Danh sách email không được để trống")
    private List<String> emails;

    // TEACHER | STUDENT | MEMBER
    @Pattern(regexp = "TEACHER|STUDENT|MEMBER",
            message = "Role phải là TEACHER, STUDENT hoặc MEMBER")
    private String role = "STUDENT";
}