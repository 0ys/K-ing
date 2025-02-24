package com.king.backend.domain.user.dto.response;

import com.king.backend.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserProfileResponseDTO {
    private Long userId;
    private String email;
    private String nickname;
    private String imageUrl;
    private String description;
    private Boolean contentAlarmOn;
    private String language;

    public static UserProfileResponseDTO fromEntity(User user) {
        return new UserProfileResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getImageUrl(),
                user.getDescription(),
                null,
                null
        );
    }

    public static UserProfileResponseDTO fromSelfEntity(User user) {
        return new UserProfileResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getImageUrl(),
                user.getDescription(),
                user.getContentAlarmOn(),
                user.getLanguage()
        );
    }
}
