package com.king.backend.domain.cast.entity;

import com.king.backend.search.service.SyncService;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CastListener {
    private static SyncService syncService;

    @Autowired
    public void setSyncService(SyncService syncService) {
        CastListener.syncService = syncService;
    }

    @PrePersist
    @PreUpdate
    public void prePersist(Cast cast) {
        syncService.updateCast(cast);
    }

    @PostRemove
    public void postRemove(Cast cast) {
        syncService.deleteCast(cast.getId());
    }
}
