import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  back?: boolean;
  right?: React.ReactNode;
}

export default function NavBar({ title, back = true, right }: Props) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100 bg-white">
      <div className="w-8">
        {back && (
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-500">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 5l-6 6 6 6" />
            </svg>
          </button>
        )}
      </div>
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <div className="w-8 flex justify-end">{right}</div>
    </div>
  );
}
