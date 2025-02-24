package com.king.backend.domain.user.repository;

import com.king.backend.domain.user.entity.TokenEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenRepository extends CrudRepository<TokenEntity, Long> {
    void deleteById(Long id);
}
