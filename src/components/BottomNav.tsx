import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
  icon: (active: boolean) => React.ReactNode;
}

interface Props {
  items: NavItem[];
}

export default function BottomNav({ items }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="border-t border-gray-100 bg-white px-2 pb-6 pt-2 flex">
      {items.map((item) => {
        const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center gap-1 py-1 transition-colors ${
              active ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {item.icon(active)}
            <span className="text-[11px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
