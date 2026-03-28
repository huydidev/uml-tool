package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.UserEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<UserEntity, String> {
    Optional<UserEntity> findByEmail(String email);

    Boolean existsByEmail(String email);
}
