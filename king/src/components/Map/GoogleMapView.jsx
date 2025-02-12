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

const GoogleMapView = ({ places, isSearch, nowActiveMarker, onMarkerClick, $isExpanded }) => {
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [activePlaceId, setActivePlaceId] = useState(places?.[0]?.placeId || null);
  const [preventFitBounds, setPreventFitBounds] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (mapInstance && places.length > 0) {
      mapInstance.setCenter({ lat: places[0].lat, lng: places[0].lng });
    }
  }, [places]);

  const createMarker = useCallback(
    (map, place) => {
      const markerElement = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: place.lat, lng: place.lng },
        map,
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
        handleMarkerClick(map, place);
      });

      return markerElement;
    },
    [activePlaceId, onMarkerClick],
  );

  const handleMarkerClick = useCallback(
    (map, place) => {
      setPreventFitBounds(true);
      setActivePlaceId(place.placeId);

      if (onMarkerClick) {
        onMarkerClick(place.placeId);
      }

      setTimeout(() => {
        map.setCenter({ lat: place.lat, lng: place.lng });
        map.setZoom(16);
      }, 100);
    },
    [onMarkerClick, activePlaceId],
  );

  useEffect(() => {
    if (mapInstance && nowActiveMarker !== 0) {
      const activePlace = places.find((place) => place.placeId === nowActiveMarker);
      if (activePlace) {
        handleMarkerClick(mapInstance, activePlace);
      }
    }
  }, [nowActiveMarker, mapInstance, places, handleMarkerClick]);

  useEffect(() => {
    if (mapInstance) {
      const clickListener = mapInstance.addListener('click', () => {
        if (activePlaceId) {
          setActivePlaceId(null);
          onMarkerClick(0);
        }
      });

      return () => google.maps.event.removeListener(clickListener);
    }
  }, [mapInstance, activePlaceId, setActivePlaceId]);

  // Reset preventFitBounds after map or places update
  useEffect(() => {
    setPreventFitBounds(false);
  }, [mapInstance, places]);

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

    console.log('검색 중심 좌표:', { lat: center.lat(), lng: center.lng() });
    console.log('검색 반지름 (미터):', radius);
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

          new google.maps.marker.AdvancedMarkerElement({
            position: { lat: latitude, lng: longitude },
            map: mapInstance,
            content: container,
          });
        }
      },
      (error) => console.error('Error fetching location:', error),
    );
  }, [mapInstance]);

  useEffect(() => {
    if (mapInstance && places.length > 0) {
      // 기존 마커 제거
      markers.forEach((marker) => marker.setMap(null));

      // 새 마커 생성 및 추가
      const bounds = new google.maps.LatLngBounds();

      const newMarkers = places.map((place) => {
        const markerElement = createMarker(mapInstance, place);
        bounds.extend({ lat: place.lat, lng: place.lng });
        return markerElement;
      });

      setMarkers(newMarkers);

      if (!preventFitBounds) {
        if (places.length > 1) {
          mapInstance.fitBounds(bounds, { padding: 24 });
        } else if (places.length === 1) {
          const singleMarker = places[0];
          mapInstance.setCenter({ lat: singleMarker.lat, lng: singleMarker.lng });
          mapInstance.setZoom(16);
        }
      }
    }
  }, [mapInstance, places, preventFitBounds, activePlaceId]);

  const handleMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <GoogleMapContainer>
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
              <img src={RefreshIcon} alt="here" />이 지역에서 검색
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
