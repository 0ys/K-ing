import { css, DefaultTheme } from "styled-components";

const colors = {
  Red: "#C1121F",
  DarkRed: "#780000",
  Navy: "#0239A6",
  MainBlue: "#0062FF",
  SkyBlue: "#0062FF",
  Blue: "#669BBC",
  DarkYellow: "#D6B842",
  Yellow: "#F7D95F",
  Gray0: "#191919",
  Gray1: "#3D3D3D",
  Gray2: "#CFCED3",
  Gray3: "#E8E8F4",
  Gray4: "#EEEEFA",
  Gray5: "#F3F3F3",
  Beige: "#FFF4DE",
  White: "#FFFFFF",
};

const fonts = {
  Head0: css`
    font-family: "Pretendard";
    font-size: 4rem;
    font-style: normal;
    font-weight: 700;
    line-height: 130%; /* 5.2rem */
  `,
  Head1: css`
    font-family: "Pretendard";
    font-size: 3.2rem;
    font-style: normal;
    font-weight: 700;
    line-height: 130%; /* 4.16rem */
  `,
  Head2: css`
    font-family: "Pretendard";
    font-size: 3rem;
    font-style: normal;
    font-weight: 700;
    line-height: 130%; /* 3.9rem */
  `,
  Title1: css`
    font-family: "Pretendard";
    font-size: 2.6rem;
    font-style: normal;
    font-weight: 700;
    line-height: 130%; /* 3.38rem */
  `,
  Title2: css`
    font-family: "Pretendard";
    font-size: 2.4rem;
    font-style: normal;
    font-weight: 700;
    line-height: 130%; /* 3.12rem */
  `,
  Title3: css`
    font-family: "Pretendard";
    font-size: 2rem;
    font-style: normal;
    font-weight: 700;
    line-height: 130%; /* 2.6rem */
  `,
  Title4: css`
    font-family: "Pretendard";
    font-size: 1.8rem;
    font-style: normal;
    font-weight: 700;
    line-height: 130%; /* 2.34rem */
  `,
  Title5: css`
    font-family: "Pretendard";
    font-size: 1.6rem;
    font-style: normal;
    font-weight: 700;
    line-height: 130%; /* 2.08rem */
  `,
  Title6: css`
    font-family: "Pretendard";
    font-size: 1.4rem;
    font-style: normal;
    font-weight: 700;
    line-height: 130%; /* 2.08rem */
  `,
  Title7: css`
    font-family: "Pretendard";
    font-size: 1rem;
    font-style: normal;
    font-weight: 700;
    line-height: 130%; /* 2.08rem */
  `,
  Body0: css`
    font-family: "Pretendard";
    font-size: 2.2rem;
    font-style: normal;
    font-weight: 400;
    line-height: 130%; /* 2.86rem */
  `,
  Body1: css`
    font-family: "Pretendard";
    font-size: 1.6rem;
    font-style: normal;
    font-weight: 400;
    line-height: 130%; /* 2.08rem */
  `,
  Body2: css`
    font-family: "Pretendard";
    font-size: 1.4rem;
    font-style: normal;
    font-weight: 400;
    line-height: 130%; /* 1.69rem */
  `,
  Body3: css`
    font-family: "Pretendard";
    font-size: 1.3rem;
    font-style: normal;
    font-weight: 400;
    line-height: 130%; /* 1.82rem */
  `,
  Body4: css`
    font-family: "Pretendard";
    font-size: 1.2rem;
    font-style: normal;
    font-weight: 400;
    line-height: 130%; /* 1.56rem */
  `,
  Body5: css`
    font-family: "Pretendard";
    font-size: 1rem;
    font-style: normal;
    font-weight: 400;
    line-height: 130%; /* 1.56rem */
  `,
  Body6: css`
    font-family: "Pretendard";
    font-size: 0.9rem;
    font-style: normal;
    font-weight: 400;
    line-height: 130%; /* 1.17rem */
  `,
  Body7: css`
    font-family: "Pretendard";
    font-size: 0.8rem;
    font-style: normal;
    font-weight: 400;
    line-height: 130%; /* 1.17rem */
  `,
  Body8: css`
    font-family: "Pretendard";
    font-size: 0.7rem;
    font-style: normal;
    font-weight: 400;
    line-height: 130%; /* 0.91rem */
  `,
  Body9: css`
    font-family: "Pretendard";
    font-size: 0.6rem;
    font-style: normal;
    font-weight: 400;
    line-height: 130%; /* 0.78rem */
  `,
};

const theme: DefaultTheme = {
  colors,
  fonts,
};
export default theme;
