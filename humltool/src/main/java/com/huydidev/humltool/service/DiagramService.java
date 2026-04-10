package com.huydidev.humltool.service;

import com.huydidev.humltool.model.DiagramModel;

import java.util.List;

public interface DiagramService {

    DiagramModel saveDiagram(DiagramModel model, String token);
    DiagramModel patchDiagram(DiagramModel model, String token);
    List<DiagramModel> getAllDiagrams();
    List<DiagramModel> getMyDiagrams(String token);
    DiagramModel getDiagramById(String id);
    DiagramModel getDiagramByIdWithAuth(String id, String token);
    DiagramModel getDiagramByShareToken(String shareToken);
    void deleteDiagram(String id);

    // ── Mới ──────────────────────────────────────────────────────
    DiagramModel saveDiagramInWorkspace(
            DiagramModel model, String workspaceId, String token);
}