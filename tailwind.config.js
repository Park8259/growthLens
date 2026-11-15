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
      },
      // 베베뷰 Figma(와이어프레임 페이지) 색상
      colors: {
        brand: {
          DEFAULT: "#74DCFF", // 주요 버튼, 선택 테두리
          light: "#DFF7FF",   // 선택된 카드 배경
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
