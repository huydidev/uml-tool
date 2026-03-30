package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.DiagramEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagramRepository extends MongoRepository<DiagramEntity, String> {
    List<DiagramEntity> findByOwnerIdOrderByUpdatedAtDesc(String ownerId);
    // Chỉ cần kế thừa MongoRepository là bạn đã có sẵn save(), findAll(), delete()...
}