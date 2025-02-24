package com.king.backend.domain.content.entity;

import com.king.backend.search.service.SyncService;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ContentListener {
    private static SyncService syncService;

    @Autowired
    public void setSyncService(SyncService syncService) {
        ContentListener.syncService = syncService;
    }

    @PrePersist
    @PreUpdate
    public void preSave(Content content) {
        syncService.updateContent(content);
    }

    @PostRemove
    public void postRemove(Content content) {
        syncService.deleteContent(content.getId());
    }
}
