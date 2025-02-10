import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { client } from '../../lib/axios';

const ButtonMessageBubbleComponent = ({ message }) => {
  const navigate = useNavigate();
  const [placeId, setPlaceId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaceId = async () => {
      try {
        const response = await client.get(`/place/search?name=${encodeURIComponent(message.text)}`);
        //console.log('📩 응답 데이터:', response.data);
        setPlaceId(response.data.data.placeId || null);
      } catch (err) {
        console.error('장소 ID를 불러오는 중 오류 발생:', err);
        setError('Place ID not found');
      }
    };
    fetchPlaceId();
  }, [message]);

  const handleClick = () => {
    if (placeId) {
      //console.log(`✅ 이동할 placeId: ${placeId}`);

      navigate(`/place/${placeId}`);
    } else {
      alert('장소 정보를 불러올 수 없습니다.');
    }
  };

  return (
    <ButtonMessageBubble>
      {message.text}
      <MessageButton onClick={handleClick} disabled={!placeId || error}>
        {error ? '오류 발생' : '바로 가기'}
      </MessageButton>
    </ButtonMessageBubble>
  );
};

const ButtonMessageBubble = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  max-width: 50%;
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  background-color: #dfd9ff;
  color: ${({ theme }) => theme.colors.Gray0};
  ${({ theme }) => theme.fonts.Title6};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.07);
  word-wrap: break-word;
  white-space: pre-wrap;
  width: fit-content;
`;

const MessageButton = styled.button`
  padding: 0.2rem 0.5rem;
  background-color: #fff;
  color: #5c3eff;
  ${({ theme }) => theme.fonts.Title7};
  border: none;
  border-radius: 5px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: #a597f1;
    color: white;
  }
`;

export default ButtonMessageBubbleComponent;
