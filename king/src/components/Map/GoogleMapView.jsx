import { GridAlgorithm, MarkerClusterer } from '@googlemaps/markerclusterer';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import HereIcon from '/src/assets/icons/here.png';
import RefreshIcon from '/src/assets/icons/refresh.png';
import ActiveCafeMarker from '/src/assets/marker/active-cafe-marker.png';
import ActiveDefaultMarker from '/src/assets/marker/active-default.png';
import ActivePlaygroundMarker from '/src/assets/marker/active-playground-marker.png';
import ActiveRestaurantMarker from '/src/assets/marker/active-restaurant-marker.png';
import ActiveStationMarker from '/src/assets/marker/active-station-marker.png';
import ActiveStayMarker from '/src/assets/marker/active-stay-marker.png';
import ActiveStoreMarker from '/src/assets/marker/active-store-marker.png';
import CafeMarker from '/src/assets/marker/cafe-marker.png';
import DefaultMarker from '/src/assets/marker/default.png';
import PlaygroundMarker from '/src/assets/marker/playground-marker.png';
import RestaurantMarker from '/src/assets/marker/restaurant-marker.png';
import StationMarker from '/src/assets/marker/station-marker.png';
import StayMarker from '/src/assets/marker/stay-marker.png';
import StoreMarker from '/src/assets/marker/store-marker.png';

import { getLanguage, getTranslations } from '../../util/languageUtils';
import Loading from '../Loading/Loading';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
const libraries = ['marker', 'geometry'];

const containerStyle = {
  width: '100%',
  height: '100%',
};

// 맵 옵션 설정
const mapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
  mapId: GOOGLE_MAPS_MAP_ID,
};

// 마커 타입별 이미지 경로
const markerImages = {
  default: {
    default: DefaultMarker,
    CAFE: CafeMarker,
    PLAYGROUND: PlaygroundMarker,
    RESTAURANT: RestaurantMarker,
    STATION: StationMarker,
    STAY: StayMarker,
    STORE: StoreMarker,
  },
  active: {
    default: ActiveDefaultMarker,
    CAFE: ActiveCafeMarker,
    PLAYGROUND: ActivePlaygroundMarker,
    RESTAURANT: ActiveRestaurantMarker,
    STATION: ActiveStationMarker,
    STAY: ActiveStayMarker,
    STORE: ActiveStoreMarker,
  },
};

const GoogleMapView = ({
  places,
  isSearch,
  nowActiveMarker,
  onMarkerClick,
  onReSearch,
  $isExpanded,
  setIsExpanded,
}) => {
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [mapInstance, setMapInstance] = useState(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [activePlaceId, setActivePlaceId] = useState(places?.[0]?.placeId || null);
  const [markers, setMarkers] = useState(new Map());
  const [markerCluster, setMarkerCluster] = useState(null);
  const [isMarkersLoading, setIsMarkersLoading] = useState(true);
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);

  const [language, setLanguage] = useState(getLanguage());
  const { map: mapTranslations } = getTranslations(language);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  // 🛠️ 위치 유효성 검사 함수
  const isValidLatLng = (lat, lng) => {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null));
    setMarkers(new Map());

    // 기존 클러스터 제거
    if (markerCluster) {
      markerCluster.clearMarkers();
    }
  };

  const createMarker = useCallback(
    (place) => {
      // 🛠️ 유효한 좌표인지 확인
      if (!isValidLatLng(place.lat, place.lng)) {
        console.error('Invalid place coordinates:', place);
        return null;
      }

      // ✅ 기존 마커가 있으면 제거 후 새로운 Map 생성
      const newMarkers = new Map(markers);
      if (newMarkers.has(place.placeId)) {
        newMarkers.get(place.placeId).setMap(null);
        newMarkers.delete(place.placeId);
      }

      const markerElement = new google.maps.marker.AdvancedMarkerElement({
        position: new google.maps.LatLng(place.lat, place.lng),
        zIndex: activePlaceId === place.placeId ? 10 : 1,
      });

      const container = document.createElement('div');
      container.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      `;

      const image = document.createElement('img');
      image.src =
        activePlaceId === place.placeId
          ? markerImages.active[place.type] || markerImages.active['default']
          : markerImages.default[place.type] || markerImages.default['default'];
      image.style.cssText = `
          width: ${activePlaceId === place.placeId ? '30px' : '20px'};
          height: ${activePlaceId === place.placeId ? '42px' : '20px'};
          object-fit: cover;
          transition: width 0.2s ease, height 0.2s ease;
        `;

      const label = document.createElement('div');
      label.style.cssText = `
        font-family: "Pretendard";
        font-size: 1.2rem;
        font-style: normal;
        font-weight: ${activePlaceId === place.placeId ? 700 : 500};
        color: black;
        background-color: white;
        padding: 2px 6px;
        border-radius: 16px;
        margin-top:2px;
        opacity: ${activePlaceId === place.placeId ? 1 : 0.9}; /* 활성 상태일 때 불투명 */
        transition: opacity 0.2s ease;
      `;
      label.innerText = place.name;

      container.appendChild(image);
      container.appendChild(label);

      markerElement.content = container;

      google.maps.event.addListener(markerElement, 'click', () => {
        handleMarkerClick(place);
      });

      // ✅ 새로운 Map으로 마커 상태 업데이트
      newMarkers.set(place.placeId, markerElement);
      setMarkers(newMarkers); // ✅ React 상태 업데이트
      return markerElement;
    },
    [activePlaceId],
  );

  const handleMarkerClick = useCallback(
    (place) => {
      //if (activePlaceId === place.placeId) return;
      setActivePlaceId(place.placeId);

      if (onMarkerClick) {
        onMarkerClick(place.placeId);
      }

      if (mapInstance) {
        setTimeout(() => {
          const currentZoom = mapInstance.getZoom();
          mapInstance.setCenter({ lat: place.lat, lng: place.lng });
          if (currentZoom > 16) {
            mapInstance.setZoom(currentZoom);
          } else {
            mapInstance.setZoom(16);
          }
        }, 100);
      }
    },
    [onMarkerClick, mapInstance],
  );

  useEffect(() => {
    if (mapInstance && nowActiveMarker !== 0) {
      const activePlace = places.find((place) => place.placeId === nowActiveMarker);
      if (activePlace) {
        handleMarkerClick(activePlace);
      }
    }
  }, [nowActiveMarker, mapInstance, places, handleMarkerClick]);

  useEffect(() => {
    if (mapInstance) {
      const clickListener = mapInstance.addListener('click', () => {
        if (activePlaceId) {
          setActivePlaceId(null);
          onMarkerClick(0);
          setIsExpanded(false);
        }
      });

      return () => google.maps.event.removeListener(clickListener);
    }
  }, [mapInstance, activePlaceId, setActivePlaceId]);

  // 지도 이동 후 검색 버튼 표시
  const handleIdle = useCallback(() => {
    if (!isMapInitialized) {
      setIsMapInitialized(true);
      return;
    }
    if (isSearch) setShowSearchButton(true);
  }, [isMapInitialized]);

  // 검색 버튼 동작
  const handleSearch = useCallback(() => {
    if (!mapInstance) return;

    const center = mapInstance.getCenter();
    const bounds = mapInstance.getBounds();
    const radius =
      google.maps.geometry.spherical.computeDistanceBetween(
        bounds.getNorthEast(),
        bounds.getSouthWest(),
      ) / 2;

    // console.log('검색 중심 좌표:', { lat: center.lat(), lng: center.lng() });
    // console.log('검색 반지름 (미터):', radius);
    if (onReSearch) {
      onReSearch(bounds);
    }
    setShowSearchButton(false);
  }, [mapInstance]);

  // 현재 위치로 이동
  const moveToCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCenter = { lat: latitude, lng: longitude };
        setCenter(newCenter);

        if (mapInstance) {
          mapInstance.panTo(newCenter);
          const currentZoom = mapInstance.getZoom();
          if (currentZoom > 16) {
            mapInstance.setZoom(currentZoom);
          } else {
            mapInstance.setZoom(16);
          }

          // ✅ 기존 현재 위치 마커가 있으면 삭제
          if (currentLocationMarker) {
            currentLocationMarker.setMap(null);
          }

          // 현재 위치 마커 추가
          const container = document.createElement('div');
          container.style.cssText = `
          position: relative;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: rgba(0, 123, 255, 0.3);
          animation: pulse 1.5s infinite;
        `;

          const innerCircle = document.createElement('div');
          innerCircle.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          background-color: #007bff;
          border-radius: 50%;
        `;

          container.appendChild(innerCircle);

          const newMarker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: latitude, lng: longitude },
            map: mapInstance,
            content: container,
          });

          setCurrentLocationMarker(newMarker);
        }
      },
      (error) => console.error('Error fetching location:', error),
    );
  }, [mapInstance, currentLocationMarker]);

  useEffect(() => {
    if (mapInstance) {
      setIsMarkersLoading(true);
      clearMarkers();

      setTimeout(() => {
        // const newMarkers = places.map(createMarker).filter((marker) => marker !== null);

        const newMarkers = new Map();
        places.forEach((place) => {
          const marker = createMarker(place);
          if (marker) newMarkers.set(place.placeId, marker);
        });

        setMarkers(newMarkers);

        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
          bounds.extend(new google.maps.LatLng(place.lat, place.lng));
        });

        if (places.length > 1) {
          mapInstance.fitBounds(bounds);
        } else if (places.length === 1) {
          mapInstance.setCenter(new google.maps.LatLng(places[0].lat, places[0].lng));
          mapInstance.setZoom(16);
        }

        if (markerCluster) {
          markerCluster.clearMarkers();
        }

        // 클러스터링 적용
        const newCluster = new MarkerClusterer({
          map: mapInstance,
          markers: Array.from(newMarkers.values()),
          algorithm: new GridAlgorithm({
            gridSize: 50,
            minimumClusterSize: 3,
          }),
          renderer: {
            render: ({ count, position, markers }) => {
              // 클러스터에 포함된 마커 숨김
              //markers.forEach((marker) => (marker.map = null));

              const clusterDiv = document.createElement('div');
              clusterDiv.innerHTML = `<div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(0, 0, 255, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                color: white;
              ">${count}</div>`;

              const clusterMarker = new google.maps.marker.AdvancedMarkerElement({
                position,
                content: clusterDiv,
              });

              google.maps.event.addListener(clusterMarker, 'click', () => {
                // 클러스터 클릭 시 확대
                const clusterBounds = new google.maps.LatLngBounds();
                markers.forEach((marker) => clusterBounds.extend(marker.position));
                mapInstance.fitBounds(clusterBounds);
              });

              return clusterMarker;
            },
          },
        });

        setMarkerCluster(newCluster);
        setIsMarkersLoading(false);
      }, 100);
    }
  }, [mapInstance, places, createMarker, activePlaceId]);

  const handleMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <GoogleMapContainer>
      {(!isLoaded || isMarkersLoading) && <Loading />}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center || { lat: 37.5665, lng: 126.978 }}
        zoom={14}
        options={mapOptions}
        onLoad={handleMapLoad}
        onIdle={handleIdle} // 지도 이동 후 이벤트
      />
      {!$isExpanded && (
        <>
          {/* 현재 위치 버튼 */}
          <HereButton onClick={moveToCurrentLocation} $isMarkerFocus={activePlaceId}>
            <img src={HereIcon} alt="here" />
          </HereButton>

          {/* 이 지역에서 다시 검색 */}
          {showSearchButton && (
            <SearchButton onClick={handleSearch} $isMarkerFocus={activePlaceId}>
              <img src={RefreshIcon} alt="here" />
              {mapTranslations.search}
            </SearchButton>
          )}
        </>
      )}
    </GoogleMapContainer>
  );
};

const GoogleMapContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100vh - 16rem);
  min-height: 40rem;
  background-color: red;

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.5);
      opacity: 0.5;
    }
    100% {
      transform: scale(1);
      opacity: 0.8;
    }
  }
`;

const HereButton = styled.button`
  position: absolute;
  bottom: ${({ $isMarkerFocus }) => ($isMarkerFocus ? '16rem' : '4rem')};
  right: 2rem;
  background-color: #fff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: #ccc;
  }

  img {
    width: 1.5rem;
    height: 1.5rem;
    object-fit: contain; /* 이미지가 왜곡되지 않도록 설정 */
  }
`;

const SearchButton = styled.button`
  position: absolute;
  bottom: ${({ $isMarkerFocus }) => ($isMarkerFocus ? '16.5rem' : '4.5rem')};
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffffff;
  ${({ theme }) => theme.fonts.Body3};
  color: ${({ theme }) => theme.colors.Gray0};
  border: none;
  border-radius: 20px;
  padding: 0.6rem 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #f0f0f0;
  }

  img {
    width: 1.5rem;
    height: 1.5rem;
    object-fit: contain; /* 이미지가 왜곡되지 않도록 설정 */
  }
`;

export default GoogleMapView;
