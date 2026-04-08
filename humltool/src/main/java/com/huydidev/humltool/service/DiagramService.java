package com.huydidev.humltool.service;

import com.huydidev.humltool.model.DiagramModel;

import java.util.List;

public interface DiagramService {
    DiagramModel saveDiagram(DiagramModel model, String token);

    DiagramModel patchDiagram(DiagramModel model, String token);

    List<DiagramModel> getAllDiagrams();

    List<DiagramModel> getMyDiagrams(String token);

    // Không check quyền — dùng nội bộ (version restore, collab join)
    DiagramModel getDiagramById(String id);

    // Check quyền — dùng khi FE mở editor
    DiagramModel getDiagramByIdWithAuth(String id, String token);

    // Mở diagram qua shareToken — public read-only
    DiagramModel getDiagramByShareToken(String shareToken);

    void deleteDiagram(String id);
}