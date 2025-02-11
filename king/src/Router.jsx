import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import ArchivePage from './pages/ArchivePage';
import CelebDetailPage from './pages/CelebDetailPage';
import ChatbotPage from './pages/ChatbotPage';
import ContentDetailPage from './pages/ContentDetailPage';
import ContentPage from './pages/ContentPage';
import CurationDetailPage from './pages/CurationDetailPage';
import CurationMapPage from './pages/CurationMapPage';
import CurationPage from './pages/CurationPage';
import CurationUploadPage from './pages/CurationUploadPage';
import ErrorPage from './pages/ErrorPage';
import FavoritesDetailPage from './pages/FavoritesDetailPage';
import FeedDetailPage from './pages/FeedDetailPage';
import FeedPage from './pages/FeedPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import LoadingPage from './pages/LoadingPage';
import MapPage from './pages/MapPage';
import MyPage from './pages/MyPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import PostUpdatePage from './pages/PostUpdatePage';
import PostUploadPage from './pages/PostUploadPage';
import ReviewFeedPage from './pages/ReviewFeedPage';
import SearchDeatilPage from './pages/ReviewFeedPage';
import SearchFilterPage from './pages/SearchFilterPage';
import SearchKeywordpage from './pages/SearchKeywordPage';
import SearchResultPage from './pages/SearchResultPage';
import SettingDetailPage from './pages/SettingDetailPage';
import SettingPage from './pages/SettingPage';
import SignupCompletePage from './pages/SignupCompletePage';
import SignupPage from './pages/SignupPage';
import TokenPage from './pages/TokenPage';
import UserPage from './pages/UserPage';

const Router = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RecoilRoot>
        <Suspense>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/token" element={<TokenPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/signup/complete" element={<SignupCompletePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/upload/post" element={<PostUploadPage />} />
              <Route path="/update/post/:postId" element={<PostUpdatePage />} />
              <Route path="/upload/curation" element={<CurationUploadPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/favorites/:type" element={<FavoritesDetailPage />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/user/:userId" element={<UserPage />} />
              <Route path="/setting" element={<SettingPage />} />
              <Route path="/setting/:settingType" element={<SettingDetailPage />} />
              <Route path="/curation" element={<CurationPage />} />
              <Route path="/curation/:curationId" element={<CurationDetailPage />} />
              <Route path="/curation/map" element={<CurationMapPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/feed/:postId" element={<FeedDetailPage />} />
              <Route path="/content/:contentType" element={<ContentPage />} />
              <Route path="/content/cast/:celebId" element={<CelebDetailPage />} />
              <Route path="/content/detail/:contentId" element={<ContentDetailPage />} />
              <Route path="/loading" element={<LoadingPage />} />
              {/* 카테고리 설정시 */}
              <Route path="/search/keyword" element={<SearchKeywordpage />} />
              <Route path="/search/keyword/filter" element={<SearchFilterPage />} />
              {/* 통합검색시 */}
              <Route path="/search/result" element={<SearchResultPage />} />
              <Route path="/search/detail/:type" element={<SearchDeatilPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/place/:placeId" element={<PlaceDetailPage />} />
              <Route path="/reviewfeed/:placeId" element={<ReviewFeedPage />} />
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </RecoilRoot>
    </BrowserRouter>
  );
};

export default Router;
