import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import GraphSection from "./GraphSection";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen">
      {/* 상단 메뉴바 */}
      <Navbar />

      <div className="flex flex-1">
        {/* 왼쪽 사이드바 */}
        <Sidebar />

        {/* 가운데 그래프 섹션 */}
        <GraphSection />
      </div>
    </div>
  );
}