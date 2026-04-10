// src/main/java/com/huydidev/humltool/service/GradeService.java

package com.huydidev.humltool.service;

import com.huydidev.humltool.dto.request.GradeRequest;
import com.huydidev.humltool.dto.response.GradeResponse;

import java.util.List;

public interface GradeService {

    // Chấm điểm hoặc cập nhật điểm
    GradeResponse upsertGrade(String workspaceId, GradeRequest request, String token);

    // Lấy tất cả grade trong workspace
    // Teacher: tất cả, Student: của mình (check gradeVisible setting)
    List<GradeResponse> getWorkspaceGrades(String workspaceId, String token);

    // Lấy grade của 1 diagram cụ thể
    GradeResponse getDiagramGrade(String workspaceId, String diagramId, String token);

    // Xóa grade — Teacher/Owner only
    void deleteGrade(String workspaceId, String gradeId, String token);
}