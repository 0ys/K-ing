package com.king.backend.domain.place.entity;

import com.king.backend.search.service.SyncService;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PlaceListener {
    private static SyncService syncService;

    @Autowired
    public void setSyncService(SyncService syncService) {
        PlaceListener.syncService = syncService;
    }

    @PrePersist
    @PreUpdate
    public void prePersist(Place place) {
        syncService.updatePlace(place);
    }

    @PostRemove
    public void postRemove(Place place) {
        syncService.updatePlace(place);
    }
}
