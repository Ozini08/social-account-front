import React from "react";
import { KakaoLogin } from "./KakaoLogin"; // KakaoLogin 컴포넌트 임포트
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SideDesktop } from "./side/SideDesktop";
import { LoginMemberProvider } from "./MemberContext";
import { Members } from "./Members";
import { Groups } from "./Groups";

function Layout() {
  // 사이드바를 보여줄 경로

  // function App() {
  return (
    <div className="App">
      <SideDesktop />
      {/* 나중에 여기에 Routes도 추가할 수 있음 */}
      <div className="page-content">
        <LoginMemberProvider>
          <Routes>
            <Route path="/" element={<KakaoLogin />} />
            <Route path="/members" element={<Members />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/teams" element={<div>팀</div>} />
            <Route path="/events" element={<div>행사</div>} />
            <Route path="/schedule" element={<div>일정</div>} />
            {/* 기타 경로 */}
          </Routes>
        </LoginMemberProvider>
        {/* <KakaoLogin /> */}
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
