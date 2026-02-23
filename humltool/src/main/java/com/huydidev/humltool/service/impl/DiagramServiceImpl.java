package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.exceptions.ResourceNotFoundException;
import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.service.DiagramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service // Đánh dấu đây là Bean để Spring quản lý
public class DiagramServiceImpl implements DiagramService {

    @Autowired
    private DiagramRepository repository;

    @Override
    public DiagramModel saveDiagram(DiagramModel model) {
        DiagramEntity entity = new DiagramEntity();

        if (model.getId() == null || model.getId().isBlank()){
            entity.setId(UUID.randomUUID().toString());
            entity.setCreatedAt(LocalDateTime.now());
        }else {
            entity.setId(model.getId());
            repository.findById(model.getId())
                    .ifPresent(existing -> entity.setCreatedAt(existing.getCreatedAt()));
        }

        entity.setTitle(model.getTitle());
        entity.setAuthor(model.getAuthor());
        entity.setContent(model.getContent());
        entity.setUpdatedAt(LocalDateTime.now());

        return mapToModel(repository.save(entity));
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
        model.setAuthor(entity.getAuthor());
        model.setContent(entity.getContent());
        return model;
    }

    @Override
    public DiagramModel getDiagramById(String id) {
        return repository.findById(id)
                .map(this::mapToModel)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy diagram: " + id));
    }

    @Override
    public void deleteDiagram(String id){
        repository.deleteById(id);
    }
}