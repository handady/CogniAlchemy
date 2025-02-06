import React from "react";

const SideBar = () => {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">侧边栏</h2>
        <nav>
          <ul>
            <li className="mb-4">
              <a href="#" className="hover:underline">
                菜单项 1
              </a>
            </li>
            <li className="mb-4">
              <a href="#" className="hover:underline">
                菜单项 2
              </a>
            </li>
            <li className="mb-4">
              <a href="#" className="hover:underline">
                菜单项 3
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default SideBar;
