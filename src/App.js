import React from "react";
import { KakaoLogin } from "./KakaoLogin"; // KakaoLogin 컴포넌트 임포트
import "./App.css";
import { useLocation, BrowserRouter, Routes, Route } from "react-router-dom";
import { SideDesktop } from "./side/SideDesktop";

function Layout() {
  const location = useLocation();

  // 사이드바를 보여줄 경로
  const showSidebarPaths = ["/members", "/groups", "/teams", "/events", "/schedule"];

  const showSidebar = showSidebarPaths.includes(location.pathname);
  // function App() {
  return (
    <div className="App">
      {showSidebar && <SideDesktop />}
      {/* 나중에 여기에 Routes도 추가할 수 있음 */}
      <div className="page-content">
        <Routes>
          <Route path="/groups" element={<div>그룹</div>} />
          <Route path="/teams" element={<div>팀</div>} />
          <Route path="/events" element={<div>행사</div>} />
          <Route path="/schedule" element={<div>일정</div>} />
          {/* 기타 경로 */}
        </Routes>
        <KakaoLogin />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
