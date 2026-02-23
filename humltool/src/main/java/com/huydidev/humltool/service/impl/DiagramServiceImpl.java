package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.service.DiagramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service // Đánh dấu đây là Bean để Spring quản lý
public class DiagramServiceImpl implements DiagramService {

    @Autowired
    private DiagramRepository repository;

    @Override
    public DiagramModel saveDiagram(DiagramModel model) {
        // Logic chuyển đổi và lưu trữ như mình đã bàn
        DiagramEntity entity = new DiagramEntity();
        // ... mapping dữ liệu ...
        DiagramEntity saved = repository.save(entity);
        return mapToModel(saved);
    }

    @Override
    public List<DiagramModel> getAllDiagrams() {
        return repository.findAll().stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

    private DiagramModel mapToModel(DiagramEntity entity) {
        DiagramModel model = new DiagramModel();
        model.setId(entity.getId());
        model.setTitle(entity.getTitle());
        // ... mapping ...
        return model;
    }

    @Override
    public DiagramModel getDiagramById(String id) {
        return repository.findById(id).map(this::mapToModel).orElse(null);
    }
}