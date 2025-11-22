import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./AppRoutes";
import "./AppRoutes.css"

const App = () => {
  return (
    <div className="bg-gray-50 font-sans antialiased ">
      <Header />

      {/* FLEX LAYOUT */}
      <div className="mainContainer">
        <Sidebar />

        <main className="container2">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

export default App;
