import React from "react";

import { Menu, X, Bell, ChevronDown, Search } from "lucide-react";

const Header = () => (
  <header className="fixed top-0 left-0 w-full bg-[#2874F0] shadow-lg z-[100]">
    <div className="flex items-center justify-end h-16 px-4 lg:px-6">
      {/* RIGHT PART */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-white rounded-full hover:bg-[#2874F0]/80 transition relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-[#2874F0] bg-[#FFC312]"></span>
        </button>

        <div className="flex items-center space-x-2 cursor-pointer group">
          <img
            className="h-8 w-8 rounded-full object-cover border-2 border-white group-hover:ring-2 ring-[#FFC312]"
            src="https://placehold.co/80x80/2874F0/FFFFFF?text=A"
            alt="Admin Avatar"
          />
          <span className="hidden md:inline text-sm font-medium text-white group-hover:text-[#FFC312]">
            Admin User
          </span>
          <ChevronDown className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  </header>
);

export default Header;
