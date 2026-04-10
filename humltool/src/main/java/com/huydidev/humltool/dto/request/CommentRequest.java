// src/main/java/com/huydidev/humltool/dto/request/CommentRequest.java

package com.huydidev.humltool.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    // null = comment chung cho diagram
    private String nodeId;

    // null = comment gốc, có giá trị = reply
    private String parentId;
}