/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Apple SD Gothic Neo"',
          "sans-serif",
        ],
        // Figma 정보입력 섹션(역할 선택·아이 정보·출생 정보)은 Noto Sans KR
        noto: ['"Noto Sans KR"', '"Pretendard Variable"', "sans-serif"],
      },
      // 베베뷰 Figma(와이어프레임 페이지) 색상
      colors: {
        brand: {
          DEFAULT: "#74DCFF", // 주요 버튼, 선택 테두리
          light: "#DFF7FF",   // 선택된 카드 배경
          soft: "#E6F8FF",    // 아이콘 바탕, 안내 상자
          chip: "#DAF6FF",    // 과제 이름 칩
          photo: "#DCEFF6",   // 사진·영상 자리
          icon: "#009ED3",    // 아이콘
          deep: "#0E8DBA",    // 강조 글자
        },
        // 부모·의사 앱 화면 공통 글자/면 색
        p: {
          title: "#111111",
          body: "#333333",
          gray: "#767676",
          light: "#A8A8A8",
          faint: "#C8CBD0",
          line: "#E3E5E8",
          card: "#F3F4F6",
          dark: "#34444C",    // 촬영 화면 배경
        },
        warn: {
          bg: "#FFF8CA",
          text: "#C28514",
          dot: "#E8590C",
        },
        ink: {
          DEFAULT: "#222222", // 제목, 입력값
          strong: "#17202B",  // 큰 제목
          sub: "#555555",     // 라벨, 보조 글
          muted: "#5B6573",   // 설명 글
          hint: "#999999",    // 안내 글(placeholder)
          faint: "#CCCCCC",   // 휠의 먼 항목
        },
        line: {
          DEFAULT: "#BBBBBB", // 입력칸 테두리
          soft: "#D9D9D9",    // 선택 안 된 카드 테두리
          divider: "#E5E5E5", // 상단 구분선
        },
        fill: {
          cancel: "#EBEBEB",  // 취소 버튼
          wheel: "#F2F2F2",   // 휠 선택 영역
          card: "#EEEEEE",    // 역할 선택 카드
          disabled: "#E4E4E4",
        },
      },
      keyframes: {
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "sheet-up": "sheet-up 0.25s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
