import {
  LayoutDashboard,
  BookOpen,
  Package,
  Box,
  Calculator,
  ShoppingCart,
  BarChart3,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    active: true,
  },
  {
    title: "Recipes",
    icon: <BookOpen size={18} />,
  },
  {
    title: "Ingredients",
    icon: <Package size={18} />,
  },
  {
    title: "Packaging",
    icon: <Box size={18} />,
  },
  {
    title: "Calculator",
    icon: <Calculator size={18} />,
  },
  {
    title: "Sales",
    icon: <ShoppingCart size={18} />,
  },
  {
    title: "Reports",
    icon: <BarChart3 size={18} />,
  },
  {
    title: "Settings",
    icon: <Settings size={18} />,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-[#5A3A2E] text-white flex flex-col min-h-screen">

      {/* Logo */}
      <div className="p-8 border-b border-[#775346]">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-[#D89A4C] flex items-center justify-center">

            <span className="text-2xl">🥖</span>

          </div>

          <div>

            <h1 className="text-2xl font-bold">
              Churros
            </h1>

            <p className="text-sm text-gray-300">
              Tracker
            </p>

          </div>

        </div>

      </div>

      {/* Menu */}

      <nav className="flex-1 p-5">

        <div className="space-y-2">

          {menuItems.map((item, index) => (

            <button
              key={index}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition
              ${
                item.active
                  ? "bg-[#D89A4C] text-white"
                  : "hover:bg-[#70493b]"
              }`}
            >
              {item.icon}

              <span className="font-medium">
                {item.title}
              </span>

            </button>

          ))}

        </div>

      </nav>

      {/* User */}

      <div className="border-t border-[#775346] p-6">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-full bg-[#D89A4C] flex items-center justify-center font-bold">

            JD

          </div>

          <div>

            <h3 className="font-semibold">
              John Doe
            </h3>

            <p className="text-sm text-gray-300">
              Owner
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}