export const doctorNavItems = [
  {
    label: "환자 목록",
    path: "/doctor/patients",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="7" r="3" />
        <path d="M2 19c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" />
        <path d="M15 11h5M17.5 8.5v5" />
      </svg>
    ),
  },
  {
    label: "예약",
    path: "/doctor/appointments",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="16" height="16" rx="2" />
        <path d="M3 9h16M8 2v4M14 2v4" />
      </svg>
    ),
  },
];
