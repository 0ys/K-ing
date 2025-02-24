import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { tokenRefresh } from '../../lib/auth';
import { handleAllowNotification } from '../../service/handleAllowNotification';
import { setLanguage } from '../../util/languageUtils';

const Token = () => {
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate(); // 페이지 이동을 위한 Hook

  useEffect(() => {
    const refresh = async () => {
      const newToken = await tokenRefresh();
      if (newToken) {
        setToken(newToken);

        // JWT 디코딩하여 role 값 추출
        try {
          const decoded = jwtDecode(newToken);
          setRole(decoded.role); // "ROLE_PENDING", "ROLE_REGISTERED" 등

          // 새로운 `language` 값으로 localStorage 업데이트
          if (decoded.language) {
            setLanguage(decoded.language);
          }

          // role에 따라 페이지 이동
          if (decoded.role === 'ROLE_PENDING') {
            navigate('/signup'); // 회원가입 페이지로 이동
          } else if (decoded.role === 'ROLE_REGISTERED') {
            handleAllowNotification();
            navigate('/home'); // 홈 페이지로 이동
          } else {
            navigate('/'); // 잘못된 값이 들어오면 메인 페이지로 이동
          }
        } catch (error) {
          console.error('JWT 디코딩 실패:', error);
        }
      }
    };

    refresh();
  }, []);

  return <div></div>;
};

export default Token;
