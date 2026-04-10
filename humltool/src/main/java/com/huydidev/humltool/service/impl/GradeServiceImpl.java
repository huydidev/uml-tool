// src/main/java/com/huydidev/humltool/service/impl/GradeServiceImpl.java

package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.dto.request.GradeRequest;
import com.huydidev.humltool.dto.response.GradeResponse;
import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.entity.GradeEntity;
import com.huydidev.humltool.entity.WorkspaceEntity;
import com.huydidev.humltool.exceptions.ResourceNotFoundException;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.repository.GradeRepository;
import com.huydidev.humltool.repository.UserRepository;
import com.huydidev.humltool.repository.WorkspaceMemberRepository;
import com.huydidev.humltool.repository.WorkspaceRepository;
import com.huydidev.humltool.service.GradeService;
import com.huydidev.humltool.service.WorkspaceMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GradeServiceImpl implements GradeService {

    @Autowired private GradeRepository           gradeRepository;
    @Autowired private DiagramRepository         diagramRepository;
    @Autowired private WorkspaceRepository       workspaceRepository;
    @Autowired private WorkspaceMemberRepository memberRepository;
    @Autowired private UserRepository            userRepository;
    @Autowired private WorkspaceMemberService    memberService;
    @Autowired private JwtUtils                  jwtUtils;

    // ── Chấm điểm hoặc cập nhật điểm ────────────────────────────
    @Override
    public GradeResponse upsertGrade(
            String workspaceId, GradeRequest request, String token) {

        String teacherId = jwtUtils.getUserNameFromJwtToken(token);

        // Chỉ TEACHER hoặc OWNER mới chấm được
        if (!memberService.isTeacherOrOwner(workspaceId, teacherId)) {
            throw new RuntimeException("FORBIDDEN");
        }

        // Check diagram tồn tại và thuộc workspace này
        DiagramEntity diagram = diagramRepository.findById(request.getDiagramId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy diagram"));

        if (!workspaceId.equals(diagram.getWorkspaceId())) {
            throw new RuntimeException("Diagram không thuộc workspace này");
        }

        // Upsert — nếu đã có grade thì update, chưa có thì tạo mới
        GradeEntity grade = gradeRepository
                .findByDiagramIdAndStudentId(
                        request.getDiagramId(), request.getStudentId())
                .orElse(new GradeEntity());

        grade.setWorkspaceId(workspaceId);
        grade.setDiagramId(request.getDiagramId());
        grade.setStudentId(request.getStudentId());
        grade.setTeacherId(teacherId);
        grade.setScore(request.getScore());
        grade.setFeedback(request.getFeedback());
        grade.setUpdatedAt(LocalDateTime.now());

        if (grade.getGradedAt() == null) {
            grade.setGradedAt(LocalDateTime.now());
        }

        return mapToResponse(gradeRepository.save(grade));
    }

    // ── Lấy tất cả grade trong workspace ─────────────────────────
    // Teacher: tất cả
    // Student: của mình (check gradeVisible setting)
    @Override
    public List<GradeResponse> getWorkspaceGrades(String workspaceId, String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);
        String role   = memberService.getMyRole(workspaceId, userId);

        if (role == null) throw new RuntimeException("FORBIDDEN");

        // Teacher/Owner thấy tất cả
        if ("OWNER".equals(role) || "TEACHER".equals(role)) {
            return gradeRepository
                    .findByWorkspaceIdOrderByGradedAtDesc(workspaceId)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Student — check gradeVisible setting
        WorkspaceEntity workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace không tồn tại"));

        String gradeVisible = workspace.getSettings() != null
                ? workspace.getSettings().getGradeVisible()
                : "SELF_ONLY";

        if ("ALL".equals(gradeVisible)) {
            // Thấy tất cả nhưng ẩn thông tin student khác
            return gradeRepository
                    .findByWorkspaceIdOrderByGradedAtDesc(workspaceId)
                    .stream()
                    .map(grade -> {
                        GradeResponse response = mapToResponse(grade);
                        // Ẩn thông tin nếu không phải grade của mình
                        if (!userId.equals(grade.getStudentId())) {
                            response.setStudentId("***");
                            response.setStudentName("Ẩn danh");
                        }
                        return response;
                    })
                    .collect(Collectors.toList());
        }

        // SELF_ONLY — chỉ thấy của mình
        return gradeRepository
                .findByWorkspaceIdAndStudentId(workspaceId, userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Lấy grade của 1 diagram cụ thể ───────────────────────────
    @Override
    public GradeResponse getDiagramGrade(
            String workspaceId, String diagramId, String token) {

        String userId = jwtUtils.getUserNameFromJwtToken(token);
        String role   = memberService.getMyRole(workspaceId, userId);

        if (role == null) throw new RuntimeException("FORBIDDEN");

        // Teacher/Owner xem được grade của bất kỳ diagram nào
        if ("OWNER".equals(role) || "TEACHER".equals(role)) {
            return gradeRepository.findByDiagramId(diagramId)
                    .stream()
                    .findFirst()
                    .map(this::mapToResponse)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Diagram này chưa được chấm điểm"));
        }

        // Student chỉ xem được grade của diagram mình
        DiagramEntity diagram = diagramRepository.findById(diagramId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy diagram"));

        if (!userId.equals(diagram.getOwnerId())) {
            throw new RuntimeException("FORBIDDEN");
        }

        return gradeRepository
                .findByDiagramIdAndStudentId(diagramId, userId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Diagram này chưa được chấm điểm"));
    }

    // ── Xóa grade ─────────────────────────────────────────────────
    @Override
    public void deleteGrade(String workspaceId, String gradeId, String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        if (!memberService.isTeacherOrOwner(workspaceId, userId)) {
            throw new RuntimeException("FORBIDDEN");
        }

        GradeEntity grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy grade"));

        if (!workspaceId.equals(grade.getWorkspaceId())) {
            throw new RuntimeException("Grade không thuộc workspace này");
        }

        gradeRepository.delete(grade);
    }

    // ── Map entity → response ─────────────────────────────────────
    private GradeResponse mapToResponse(GradeEntity grade) {
        String diagramTitle = diagramRepository
                .findById(grade.getDiagramId())
                .map(DiagramEntity::getTitle)
                .orElse("Untitled");

        String studentName = userRepository
                .findByEmail(grade.getStudentId())
                .map(u -> u.getName() != null ? u.getName() : u.getEmail())
                .orElse(grade.getStudentId());

        String teacherName = userRepository
                .findByEmail(grade.getTeacherId())
                .map(u -> u.getName() != null ? u.getName() : u.getEmail())
                .orElse(grade.getTeacherId());

        return GradeResponse.builder()
                .id(grade.getId())
                .workspaceId(grade.getWorkspaceId())
                .diagramId(grade.getDiagramId())
                .diagramTitle(diagramTitle)
                .studentId(grade.getStudentId())
                .studentName(studentName)
                .teacherId(grade.getTeacherId())
                .teacherName(teacherName)
                .score(grade.getScore())
                .feedback(grade.getFeedback())
                .gradedAt(grade.getGradedAt())
                .updatedAt(grade.getUpdatedAt())
                .build();
    }
}