import { NavLink } from "react-router";
import {
  LayoutDashboard,
  FlaskConical,
  ClipboardList,
  BookOpen,
  Image,
  Download,
} from "lucide-react";

const tabs = [
  { to: "/dashboard",  icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/workflow",   icon: FlaskConical,     label: "Workflow"   },
  { to: "/datasheet",  icon: ClipboardList,    label: "Data Sheet" },
  { to: "/reference",  icon: BookOpen,         label: "Reference"  },
  { to: "/gallery",    icon: Image,            label: "Gallery"    },
  { to: "/export",     icon: Download,         label: "Export"     },
];

export default function TabBar() {
  return (
    <nav className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 safe-pb">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs transition-colors ${
                isActive
                  ? "text-usafa-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
                  : "text-slate-500 dark:text-slate-400 hover:text-usafa-blue dark:hover:text-blue-400"
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="truncate text-[10px]">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
