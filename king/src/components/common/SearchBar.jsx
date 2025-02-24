import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { IcSearch } from '../../assets/icons';
import { getAutoKeyword, getSearchResult } from '../../lib/search';
import { ContentType } from '../../recoil/atom';
import { getContentTypeLocalized } from '../../util/getContentType';
import { getLanguage, getTranslations } from '../../util/languageUtils'; // ✅ 번역 유틸 추가

const SearchBar = ({ type, query, onSearch, onFocus, onBlur, onSet }) => {
  const [keyword, setKeyword] = useState(query);
  const [category, setCategory] = useState('');
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);
  const [isDropDown, setIsDropDown] = useState(true);
  const setContentType = useSetRecoilState(ContentType);

  const navigate = useNavigate();
  const language = getLanguage();
  const { search: translations } = getTranslations(language);

  const handleSearchChange = useCallback(
    debounce(async (searchText) => {
      const res = await getAutoKeyword(searchText, type);
      if (searchText && res.results.length === 0) {
        setAutoCompleteOptions([{ name: '검색결과가 없습니다.', category: '' }]);
      } else {
        setAutoCompleteOptions(res.results);
      }
    }, 300),
    [type],
  );

  const onChangeData = (e) => {
    setIsDropDown(true);
    setKeyword(e.currentTarget.value);
    if (type !== 'curation') {
      handleSearchChange(e.currentTarget.value);
    }
  };

  const handleOptionClick = async (option) => {
    setContentType('autocom');
    setIsDropDown(false);

    if (onSet) {
      setAutoCompleteOptions([]);
      setKeyword(option.name);
      onSet(option);
      return;
    }

    await getSearchResult({ query: option.name, category: option.category });

    if (option.category === 'CAST') {
      navigate(`/content/cast/${option.originalId}`);
    } else if (option.category === 'PLACE') {
      navigate(`/place/${option.originalId}`);
    } else {
      navigate(`/content/detail/${option.originalId}`);
    }
  };

  const handleSubmit = () => {
    setIsDropDown(false);
    setAutoCompleteOptions([]);
    if (onSearch) {
      onSearch(keyword, category);
    }
  };

  const handleKeyEnter = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <SWrapper>
      <input
        type="text"
        placeholder={type === 'PLACE' ? translations.placeholder_place : translations.placeholder} // ✅ 번역 적용
        value={keyword}
        onChange={onChangeData}
        onKeyDown={handleKeyEnter}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <IcSearch onClick={(event) => handleSubmit(event)} />
      {autoCompleteOptions.length > 0 && (
        <AutoSearchContainer $isDropDown={isDropDown}>
          <AutoSearchWrap>
            {autoCompleteOptions.map((option, index) => (
              <AutoSearchData key={index} onClick={(event) => handleOptionClick(option, event)}>
                {option.name} <a>{getContentTypeLocalized(option.category.toLowerCase())}</a>
              </AutoSearchData>
            ))}
          </AutoSearchWrap>
        </AutoSearchContainer>
      )}
    </SWrapper>
  );
};

export default SearchBar;

const SWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;

  height: 4rem;
  width: 100%;
  box-sizing: border-box;
  margin: 1rem 0;
  padding: 0 1.5rem;

  border-radius: 10px;
  background-color: #f3f3f3;

  & > input {
    all: unset;
    flex-grow: 1;
    text-align: left;
    padding-right: 1rem;

    color: ${({ theme }) => theme.colors.Gray1};
    ${({ theme }) => theme.fonts.Body4};
  }

  & > svg {
    cursor: pointer;
  }
`;

const AutoSearchContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;

  width: 100%;
  max-height: 50vh;

  z-index: 3;

  background-color: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;

  display: ${({ $isDropDown }) => ($isDropDown ? 'block' : 'none')};
`;

const AutoSearchWrap = styled.ul``;

const AutoSearchData = styled.li`
  display: flex;
  justify-content: space-between;
  position: relative;

  padding: 1rem;
  z-index: 4;

  color: ${({ theme }) => theme.colors.Gray1};
  ${({ theme }) => theme.fonts.Body5};

  a {
    color: ${({ theme }) => theme.colors.Gray2};
    ${({ theme }) => theme.fonts.Body6};
  }

  &:hover {
    background-color: #edf5f5;
    cursor: pointer;
  }
`;
