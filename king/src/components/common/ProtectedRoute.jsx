import { jwtDecode } from 'jwt-decode';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// ✅ 토큰에서 유저 역할 가져오기
const getUserRole = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return null;

  try {
    const decoded = jwtDecode(accessToken);
    return decoded.role;
  } catch (error) {
    console.error('❌ 토큰 디코딩 실패:', error);
    return null;
  }
};

const ProtectedRoute = () => {
  const userRole = getUserRole();
  const location = useLocation();

  // 🔥 ROLE_PENDING 사용자는 회원가입 관련 페이지는 접근 가능하도록 예외 처리
  const isSignupPage = window.location.pathname.startsWith('/signup');
  if (userRole === 'ROLE_PENDING' && isSignupPage) {
    console.log('✅ ROLE_PENDING 사용자, 회원가입 페이지 접근 허용');
    return <Outlet />;
  }

  if (!userRole) {
    alert('로그인 후 이용 가능합니다.');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (userRole !== 'ROLE_REGISTERED') {
    alert('로그인 후 이용 가능합니다.');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
