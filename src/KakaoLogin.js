import { useEffect, useState } from "react";
import { useLoginMember } from "./MemberContext";
import { SignupForm } from "./SignupForm";

export const KakaoLogin = () => {
  const { loginMember, setLoginMember, fetchUserInfo } = useLoginMember();
  const [needsSignup, setNeedsSignup] = useState(false);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.REACT_APP_KAKAO_API_KEY);
      }
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleLogin = () => {
    window.Kakao.Auth.login({
      success: function (response) {
        // CSRF 토큰을 쿠키에서 읽기
        const token = getCookie("XSRF-TOKEN");
        console.log("사용할 CSRF 토큰:", token);

        setTimeout(() => {
          fetch("http://localhost:8080/api/kakao/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": token, // CSRF 토큰을 헤더에 추가
            },
            credentials: "include",
            body: JSON.stringify({ accessToken: response.access_token }),
          })
            .then((res) => {
              if (res.status === 200) return res.json();
              if (res.status === 401) throw new Error("회원가입이 필요합니다.");
              throw new Error("서버 응답 실패");
            })
            .then((data) => {
              if (data.member) {
                setLoginMember({
                  nickname: data.member.nickname,
                  profileImage: data.member.profileImageUrl,
                  auth: data.member.auth,
                });
                setNeedsSignup(false);
              }
            })
            .catch((error) => {
              if (error.message === "회원가입이 필요합니다.") {
                setNeedsSignup(true);
              } else {
                console.error("로그인 실패", error);
              }
            });
        }, 150); // 👈 100~150ms 지연 추천
      },
      fail: function (error) {
        console.error("카카오 로그인 실패", error);
      },
    });
  };

  const handleLogout = () => {
    window.Kakao.Auth.logout(() => {
      const token = getCookie("XSRF-TOKEN");
      fetch("http://localhost:8080/api/kakao/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token, // ✅ 추가
        },
        credentials: "include",
      }).then(() => {
        setLoginMember(null);
      });
    });
  };

  if (!loginMember) {
    return (
      <div>
        <button onClick={handleLogin}>카카오 로그인</button>
        {needsSignup && <SignupForm onSignupComplete={() => setNeedsSignup(false)} />}
      </div>
    );
  }

  return (
    <div>
      <h3>로그인한 사용자 정보</h3>
      <p>닉네임: {loginMember.nickname}</p>
      <p>권한: {loginMember.auth}</p>
      <img src={loginMember.profileImage} alt="프로필" width="100" />
      <br />
      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
};
