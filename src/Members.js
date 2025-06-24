import React from "react";
import { useLoginMember } from "./MemberContext";

export const Members = () => {
  const { loginMember } = useLoginMember();

  if (!loginMember || !loginMember.nickname) {
    return <p>로그인 정보가 없습니다.</p>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>로그인한 사용자 정보 (멤버 페이지)</h3>
      <p>닉네임: {loginMember.nickname}</p>
      <p>권한: {loginMember.auth}</p>
      <img src={loginMember.profileImage} alt="프로필" width="100" />
    </div>
  );
};
