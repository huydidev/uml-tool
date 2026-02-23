package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.DiagramEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiagramRepository extends MongoRepository<DiagramEntity, String> {
    // Chỉ cần kế thừa MongoRepository là bạn đã có sẵn save(), findAll(), delete()...
}