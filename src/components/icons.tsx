// Figma(와이어프레임 페이지)에서 내보낸 아이콘. 색은 글자 색(currentColor)을 따라가요.

interface IconProps {
  size?: number;
  className?: string;
}

export function ArrowDownIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 16 16".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M7.83984 3.5V12.8333M11.8398 8.83333L7.83984 12.8333L3.83984 8.83333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function ArrowUpIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 16 16".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M8 12.6667V3.33337M12 7.33337L8 3.33337L4 7.33337" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function BackIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M15 5L8 12L15 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function BallIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M2.5 12C2.5 14.5196 3.50089 16.9359 5.28249 18.7175C7.06408 20.4991 9.48044 21.5 12 21.5C14.5196 21.5 16.9359 20.4991 18.7175 18.7175C20.4991 16.9359 21.5 14.5196 21.5 12C21.5 9.48044 20.4991 7.06408 18.7175 5.28249C16.9359 3.50089 14.5196 2.5 12 2.5C9.48044 2.5 7.06408 3.50089 5.28249 5.28249C3.50089 7.06408 2.5 9.48044 2.5 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.9998 18C10.5892 18 9.22365 17.5031 8.14303 16.5964C7.06241 15.6896 6.3358 14.4312 6.09082 13.042" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function BellIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 16V11C6 9.4087 6.63214 7.88258 7.75736 6.75736C8.88258 5.63214 10.4087 5 12 5C13.5913 5 15.1174 5.63214 16.2426 6.75736C17.3679 7.88258 18 9.4087 18 11V16L19.5 18H4.5L6 16Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10 20.5C10 21.0304 10.2107 21.5391 10.5858 21.9142C10.9609 22.2893 11.4696 22.5 12 22.5C12.5304 22.5 13.0391 22.2893 13.4142 21.9142C13.7893 21.5391 14 21.0304 14 20.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function CalendarIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 20 20".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M4.99984 4.16663H14.9998C16.1504 4.16663 17.0832 5.09937 17.0832 6.24996V15C17.0832 16.1506 16.1504 17.0833 14.9998 17.0833H4.99984C3.84924 17.0833 2.9165 16.1506 2.9165 15V6.24996C2.9165 5.09937 3.84924 4.16663 4.99984 4.16663Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M2.9165 8.33333H17.0832M6.6665 2.5V5.83333M13.3332 2.5V5.83333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function CheckIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 14 14".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <path d="M2.91699 7.29167L5.54199 9.91667L11.0837 4.375" strokeWidth="1.63333" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function Chevron20Icon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 20 20".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M7.5 4.16663L13.3333 9.99996L7.5 15.8333" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function ChevronRightIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 18 18".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 18 18" fill="none" className={className} aria-hidden>
      <path d="M6.75 3.75L12 9L6.75 14.25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function HandIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 21 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 21 24" fill="none" className={className} aria-hidden>
      <path d="M0.851179 9.46007V13.3468C0.851179 15.4502 0.851179 16.5024 1.10204 17.3606C1.70026 19.4038 3.29853 21.0112 5.34176 21.7263C6.02284 21.9261 6.69938 22.1384 8.00252 22.3302C8.7631 22.4388 9.53683 22.4135 10.2887 22.2553C10.6326 22.1849 10.913 22.1247 11.1491 22.0737C11.7053 21.9533 12.2615 21.8092 12.7723 21.5583C13.349 21.2768 13.7974 20.9839 14.4467 20.4992C14.8349 20.2098 15.1902 19.8567 15.8996 19.1507L19.5854 15.4842C19.7639 15.307 19.9055 15.0962 20.0022 14.8639C20.0988 14.6317 20.1486 14.3827 20.1486 14.1311C20.1486 13.8796 20.0988 13.6306 20.0022 13.3983C19.9055 13.1661 19.7639 12.9553 19.5854 12.7781C19.2239 12.419 18.7351 12.2175 18.2255 12.2175C17.716 12.2175 17.2271 12.419 16.8656 12.7781L14.3116 15.3196V9.46007" strokeWidth="1.7027" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10.9459 4.79593V6.95496V9.4602M10.9459 4.79593C10.9459 3.8708 11.6996 3.12161 12.6293 3.12161C13.5579 3.12161 14.3116 3.8708 14.3116 4.79593V9.81776M10.9459 4.79593V2.52567C10.9459 1.60054 10.1933 0.851348 9.26365 0.851348C8.33511 0.851348 7.58138 1.60054 7.58138 2.52567V3.66648M7.58138 3.66648V9.45565V9.4602M7.58138 3.66648C7.56999 3.22773 7.38769 2.81078 7.07334 2.50449C6.75899 2.1982 6.33744 2.02679 5.89855 2.02679C5.45965 2.02679 5.03811 2.1982 4.72376 2.50449C4.40941 2.81078 4.22711 3.22773 4.21571 3.66648V6.35107V7.0662M4.21571 7.0662V8.09236V9.4602M4.21571 7.0662C4.21571 6.14107 3.46312 5.39188 2.53345 5.39188C1.60491 5.39188 0.851179 6.14107 0.851179 7.0662V10.1742" strokeWidth="1.7027" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function ImagePlaceholderIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 20 20".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M0.999997 4.59999C0.999997 3.64521 1.37928 2.72954 2.05441 2.05441C2.72954 1.37928 3.64521 0.999997 4.59999 0.999997H15.4C16.3547 0.999997 17.2704 1.37928 17.9455 2.05441C18.6207 2.72954 18.9999 3.64521 18.9999 4.59999V15.4C18.9999 16.3547 18.6207 17.2704 17.9455 17.9455C17.2704 18.6207 16.3547 18.9999 15.4 18.9999H4.59999C3.64521 18.9999 2.72954 18.6207 2.05441 17.9455C1.37928 17.2704 0.999997 16.3547 0.999997 15.4V4.59999Z" strokeWidth="1.99999" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.10007 6.84995C9.10007 8.09259 8.09271 9.09995 6.85008 9.09995C5.60744 9.09995 4.60008 8.09259 4.60008 6.84995C4.60008 5.60732 5.60744 4.59996 6.85008 4.59996C8.09271 4.59996 9.10007 5.60732 9.10007 6.84995Z" strokeWidth="1.99999" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.2735 10.5589L4.60008 19H15.5197C16.4428 19 17.328 18.6333 17.9807 17.9806C18.6334 17.328 19 16.4427 19 15.5197V15.4C19 14.9806 18.8425 14.8195 18.559 14.509L14.9321 10.5535C14.763 10.3691 14.5574 10.222 14.3283 10.1215C14.0992 10.021 13.8517 9.96937 13.6016 9.96988C13.3514 9.97039 13.1041 10.023 12.8754 10.1245C12.6468 10.2259 12.4418 10.3738 12.2735 10.5589Z" strokeWidth="1.99999" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function InfoIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 16 16".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8 7.33325V10.6666M8 5.33325H8.00667" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function LockIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 16 16".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M4.66683 6.66667H11.3335C12.0699 6.66667 12.6668 7.26362 12.6668 8V12C12.6668 12.7364 12.0699 13.3333 11.3335 13.3333H4.66683C3.93045 13.3333 3.3335 12.7364 3.3335 12V8C3.3335 7.26362 3.93045 6.66667 4.66683 6.66667Z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M5.3335 6.66667V4.66667C5.3335 3.95942 5.61445 3.28115 6.11454 2.78105C6.61464 2.28095 7.29292 2 8.00016 2C8.70741 2 9.38568 2.28095 9.88578 2.78105C10.3859 3.28115 10.6668 3.95942 10.6668 4.66667V6.66667" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function MemoIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 22 22".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 22 22" fill="none" className={className} aria-hidden>
      <path d="M3.6665 4.58333H18.3332V14.6667H8.24984L3.6665 18.3333V4.58333Z" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function NavCalendarIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 5H18C19.3807 5 20.5 6.11929 20.5 7.5V18C20.5 19.3807 19.3807 20.5 18 20.5H6C4.61929 20.5 3.5 19.3807 3.5 18V7.5C3.5 6.11929 4.61929 5 6 5Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M3.5 10H20.5M8 3V7M16 3V7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function NavChangeIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M3 17L9 11L13 15L21 7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15 7H21V13" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function NavHomeIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 11L12 4L20 11V20H15V14H9V20H4V11Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function NavMeIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4 21C4 16.6 7.6 13 12 13C16.4 13 20 16.6 20 21" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function NavPatientsIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12.5 8C12.5 9.933 10.933 11.5 9 11.5C7.067 11.5 5.5 9.933 5.5 8C5.5 6.067 7.067 4.5 9 4.5C10.933 4.5 12.5 6.067 12.5 8Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M2.5 20C2.5 16.4 5.4 13.5 9 13.5C12.6 13.5 15.5 16.4 15.5 20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M16 4.6001C16.7614 4.78611 17.4383 5.22229 17.9223 5.83877C18.4063 6.45524 18.6693 7.21633 18.6693 8.0001C18.6693 8.78386 18.4063 9.54495 17.9223 10.1614C17.4383 10.7779 16.7614 11.2141 16 11.4001M18 13.8001C20.1 14.6001 21.5 16.8001 21.5 20.0001" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function NavRecordIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M8 6H20M8 12H20M8 18H20M4 6H4.01M4 12H4.01M4 18H4.01" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function NavSummaryIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M7 3H14L19 8V21H7V3Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14 3V8H19M10 13H16M10 17H16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function NavTaskIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M7 4H17C18.1046 4 19 4.89543 19 6V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V6C5 4.89543 5.89543 4 7 4Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9 12L11 14L15 10M9 3H15V6H9V3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function PdfIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 18 18".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 18 18" fill="none" className={className} aria-hidden>
      <path d="M9 3V11.25M12.75 7.5L9 11.25L5.25 7.5M3.75 14.25H14.25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function PencilIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 20 20".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M3.3335 16.6667H6.66683L15.8335 7.50008L12.5002 4.16675L3.3335 13.3334V16.6667Z" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.25 5.41675L14.5833 8.75008" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function PhoneIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 20 20".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M7.50016 2.08333H12.5002C13.4206 2.08333 14.1668 2.82952 14.1668 3.74999V16.25C14.1668 17.1705 13.4206 17.9167 12.5002 17.9167H7.50016C6.57969 17.9167 5.8335 17.1705 5.8335 16.25V3.74999C5.8335 2.82952 6.57969 2.08333 7.50016 2.08333Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.1665 15.4167H10.8332" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function PinIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 20 20".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M9.99984 17.5C9.99984 17.5 15.8332 12.3333 15.8332 7.91667C15.8332 6.36957 15.2186 4.88584 14.1246 3.79188C13.0307 2.69791 11.5469 2.08333 9.99984 2.08333C8.45274 2.08333 6.96901 2.69791 5.87505 3.79188C4.78109 4.88584 4.1665 6.36957 4.1665 7.91667C4.1665 12.3333 9.99984 17.5 9.99984 17.5Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.0832 7.91667C12.0832 9.06726 11.1504 10 9.99984 10C8.84924 10 7.9165 9.06726 7.9165 7.91667C7.9165 6.76607 8.84924 5.83333 9.99984 5.83333C11.1504 5.83333 12.0832 6.76607 12.0832 7.91667Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function PlayIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 22 22".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 22 22" fill="none" className={className} aria-hidden>
      <path d="M4.58333 4.58334H17.4167C18.4292 4.58334 19.25 5.40415 19.25 6.41668V15.5833C19.25 16.5959 18.4292 17.4167 17.4167 17.4167H4.58333C3.57081 17.4167 2.75 16.5959 2.75 15.5833V6.41668C2.75 5.40415 3.57081 4.58334 4.58333 4.58334Z" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.89961 9.16666C9.89961 10.0779 9.16088 10.8167 8.24961 10.8167C7.33834 10.8167 6.59961 10.0779 6.59961 9.16666C6.59961 8.25539 7.33834 7.51666 8.24961 7.51666C9.16088 7.51666 9.89961 8.25539 9.89961 9.16666Z" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M19.2497 14.6667L14.6663 10.0833L7.33301 17.4167" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function PlayFillIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 24 24".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
    </svg>
  );
}

export function PlusIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 18 18".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 18 18" fill="none" className={className} aria-hidden>
      <path d="M9 3.75V9M9 9V14.25M9 9H3.75M9 9H14.25" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function QrIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 20 20".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M4.16683 3.33325H7.50016C7.9604 3.33325 8.3335 3.70635 8.3335 4.16659V7.49992C8.3335 7.96016 7.9604 8.33325 7.50016 8.33325H4.16683C3.70659 8.33325 3.3335 7.96016 3.3335 7.49992V4.16659C3.3335 3.70635 3.70659 3.33325 4.16683 3.33325Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.4998 3.33325H15.8332C16.2934 3.33325 16.6665 3.70635 16.6665 4.16659V7.49992C16.6665 7.96016 16.2934 8.33325 15.8332 8.33325H12.4998C12.0396 8.33325 11.6665 7.96016 11.6665 7.49992V4.16659C11.6665 3.70635 12.0396 3.33325 12.4998 3.33325Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.16683 11.6667H7.50016C7.9604 11.6667 8.3335 12.0398 8.3335 12.5001V15.8334C8.3335 16.2937 7.9604 16.6667 7.50016 16.6667H4.16683C3.70659 16.6667 3.3335 16.2937 3.3335 15.8334V12.5001C3.3335 12.0398 3.70659 11.6667 4.16683 11.6667Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.6665 15.0001H13.3332M14.9998 11.6667H16.6665M11.6665 11.6667H13.3332V13.3334H11.6665V11.6667ZM14.9998 15.0001H16.6665V16.6667H14.9998V15.0001Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function QuestionIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 18 18".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 18 18" fill="none" className={className} aria-hidden>
      <path d="M3 3.75H15V12H6.75L3 15V3.75Z" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function RulerIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 20 20".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M2.5 13.3333L13.3333 2.5L17.5 6.66667L6.66667 17.5L2.5 13.3333Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M5.8335 10L7.50016 11.6667M8.3335 7.5L10.0002 9.16667M10.8335 5L12.5002 6.66667" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function SearchIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 20 20".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M15.0002 9.16671C15.0002 12.3884 12.3885 15 9.16683 15C5.94517 15 3.3335 12.3884 3.3335 9.16671C3.3335 5.94505 5.94517 3.33337 9.16683 3.33337C12.3885 3.33337 15.0002 5.94505 15.0002 9.16671Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M13.75 13.75L17.5 17.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function SpeakerIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 28 28".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 28 28" fill="none" className={className} aria-hidden>
      <path d="M5.8335 10.5V17.5H10.5002L16.3335 22.1667V5.83334L10.5002 10.5H5.8335Z" strokeWidth="1.82083" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M20.4165 9.91666C21.4853 11.0071 22.084 12.4731 22.084 14C22.084 15.5269 21.4853 16.9929 20.4165 18.0833" strokeWidth="1.82083" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function SunIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 20 20".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M13.3332 10C13.3332 11.8409 11.8408 13.3333 9.99984 13.3333C8.15889 13.3333 6.6665 11.8409 6.6665 10C6.6665 8.15905 8.15889 6.66666 9.99984 6.66666C11.8408 6.66666 13.3332 8.15905 13.3332 10Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.99984 1.66666V3.33333M9.99984 16.6667V18.3333M1.6665 10H3.33317M16.6665 10H18.3332M4.1665 4.16666L5.4165 5.41666M14.5832 14.5833L15.8332 15.8333M4.1665 15.8333L5.4165 14.5833M14.5832 5.41666L15.8332 4.16666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function TrendIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 30 30".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 30 30" fill="none" className={className} aria-hidden>
      <path d="M3.75 21.25L11.25 13.75L16.25 18.75L26.25 8.75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M18.75 8.75H26.25V16.25" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

export function VideoIcon({ size, className }: IconProps) {
  const [, , w, h] = "0 0 18 18".split(" ").map(Number);
  return (
    <svg width={size ?? w} height={size ? (size * h) / w : h} viewBox="0 0 18 18" fill="none" className={className} aria-hidden>
      <path d="M4.5 1.5V16.5L16.5 9L4.5 1.5Z" fill="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
