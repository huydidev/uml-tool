// src/main/java/com/huydidev/humltool/dto/request/CreateWorkspaceRequest.java

package com.huydidev.humltool.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateWorkspaceRequest {

    @NotBlank(message = "Tên workspace không được để trống")
    private String name;

    private String description;

    @NotBlank(message = "Type không được để trống")
    @Pattern(regexp = "TEAM|CLASSROOM", message = "Type phải là TEAM hoặc CLASSROOM")
    private String type;
}