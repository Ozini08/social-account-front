import { useState, useEffect } from "react";

export const SignupForm = ({ accessToken, onSignupComplete }) => {
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [genderCode, setGenderCode] = useState("");
  const [group, setGroup] = useState("");
  const [teamMinistry1, setTeamMinistry1] = useState("");
  const [teamMinistry2, setTeamMinistry2] = useState("");
  const [teamMinistry3, setTeamMinistry3] = useState("");
  const [kakaoId, setKakaoId] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    // 카카오 사용자 정보 가져오기
    if (accessToken) {
      fetch("https://kapi.kakao.com/v2/user/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const kakaoNickname = data.properties.nickname;
          const kakaoId = data.id; // 카카오 ID
          const profileImageUrl = data.properties.profile_image; // 프로필 이미지 URL

          setNickname(kakaoNickname); // 카카오 닉네임 자동 채우기
          setKakaoId(kakaoId); // 카카오 ID 자동 채우기
          setProfileImageUrl(profileImageUrl); // 프로필 이미지 URL 자동 채우기
        })
        .catch((error) => {
          console.error("카카오 사용자 정보 가져오기 오류", error);
        });
    }
  }, [accessToken]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 백엔드로 회원가입 요청 보내기
    fetch("http://localhost:8080/api/kakao/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: accessToken,
        kakaoId: kakaoId,
        nickname: nickname,
        profileImageUrl: profileImageUrl,
        birthDate: birthDate,
        genderCode: genderCode,
        group: group,
        teamMinistry1: teamMinistry1,
        teamMinistry2: teamMinistry2,
        teamMinistry3: teamMinistry3,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("회원가입 실패");
        }
        return response.json();
      })
      .then((data) => {
        console.log("회원가입 성공", data);
        onSignupComplete(); // 회원가입 끝났을 때 콜백 호출
      })
      .catch((error) => {
        console.error("회원가입 오류", error);
      });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <h3>회원가입</h3>
      <div>
        <label>닉네임: </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
      </div>
      <div>
        <label>생년월일: </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label>주민번호 뒷자리 첫 숫자: </label>
        <input
          type="number"
          value={genderCode}
          onChange={(e) => setGenderCode(e.target.value)}
          required
        />
      </div>
      <div>
        <label>목장 (선택): </label>
        <input type="text" value={group} onChange={(e) => setGroup(e.target.value)} />
      </div>
      <div>
        <label>팀사역1 (선택): </label>
        <input
          type="text"
          value={teamMinistry1}
          onChange={(e) => setTeamMinistry1(e.target.value)}
        />
      </div>
      <div>
        <label>팀사역2 (선택): </label>
        <input
          type="text"
          value={teamMinistry2}
          onChange={(e) => setTeamMinistry2(e.target.value)}
        />
      </div>
      <div>
        <label>팀사역3 (선택): </label>
        <input
          type="text"
          value={teamMinistry3}
          onChange={(e) => setTeamMinistry3(e.target.value)}
        />
      </div>
      <button type="submit" style={{ marginTop: "10px" }}>
        회원가입 완료
      </button>
    </form>
  );
};
