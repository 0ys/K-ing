package com.king.backend.domain.user.service;

import com.king.backend.domain.user.dto.domain.LineUserDTO;
import com.king.backend.domain.user.dto.domain.OidcUserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {
    private final UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest oidcUserRequest) throws CustomException {
        OidcUser oidcUser = super.loadUser(oidcUserRequest);
        String registrationId = oidcUserRequest.getClientRegistration().getRegistrationId();

        User userEntity = null;

        if (registrationId.equals("line")) {
            LineUserDTO lineUserDTO = LineUserDTO.from(oidcUser);

            userEntity = userRepository.findByLineIdAndStatusIn(lineUserDTO.getLineId(), List.of("ROLE_PENDING", "ROLE_REGISTERED"));

            if (userEntity == null) {
                userEntity = new User();
                userEntity.setLineId(lineUserDTO.getLineId());
                userEntity.setStatus("ROLE_PENDING");
                userEntity.setEmail(lineUserDTO.getEmail());
                userEntity.setImageUrl(lineUserDTO.getImageUrl());

                userRepository.save(userEntity);
            }
        }

        if (userEntity == null) {
            throw new CustomException(UserErrorCode.OAUTH2_LOGIN_FAILED);
        }

        OidcUserDTO oidcUserDTO = new OidcUserDTO();
        oidcUserDTO.setName(userEntity.getId().toString());
        oidcUserDTO.setLanguage(userEntity.getLanguage());
        oidcUserDTO.setAuthorities(List.of(new SimpleGrantedAuthority(userEntity.getStatus())));

        return oidcUserDTO;
    }
}
