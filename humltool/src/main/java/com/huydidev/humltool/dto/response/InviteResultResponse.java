// src/main/java/com/huydidev/humltool/dto/response/InviteResultResponse.java
// Trả về kết quả bulk invite — từng email thành công hay thất bại

package com.huydidev.humltool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteResultResponse {

    private List<String> success;   // emails invite thành công
    private List<String> failed;    // emails đã là member hoặc đã invite rồi
    private List<String> notFound;  // emails không tồn tại trong hệ thống

    private int totalSuccess;
    private int totalFailed;
}