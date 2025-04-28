import { useState, useEffect } from "react";
import { SignupForm } from "./SignupForm"; // 추가

export const KakaoLogin = () => {
  const [userInfo, setUserInfo] = useState({}); // 초기값을 빈 객체로 설정
  const [needsSignup, setNeedsSignup] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(true); // 로딩 상태 관리

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo(parsedUser); // userInfo 상태를 바로 업데이트
    }
    setLoading(false); // 로딩 완료 처리

    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      const kakaoApiKey = process.env.REACT_APP_KAKAO_API_KEY;
      if (window.Kakao) {
        window.Kakao.init(kakaoApiKey); // SDK가 로드되었을 때 초기화
        console.log("카카오 SDK 초기화 완료");
      } else {
        console.error("카카오 SDK 로드 실패");
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleLogin = () => {
    window.Kakao.Auth.login({
      success: function (response) {
        const token = response.access_token;
        setAccessToken(token);

        fetch("http://localhost:8080/api/kakao/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken: token }),
        })
          .then((response) => {
            if (response.status === 200) {
              return response.json();
            } else if (response.status === 401) {
              throw new Error("회원가입이 필요합니다.");
            } else {
              throw new Error("서버 응답 실패");
            }
          })
          .then((data) => {
            if (data.member) {
              // 백엔드 데이터 저장한 다음
              const backendUserInfo = data.member;

              // 카카오에서 추가 사용자 정보 요청
              window.Kakao.API.request({
                url: "/v2/user/me",
                success: function (res) {
                  const kakaoUserInfo = {
                    nickname: res.properties.nickname,
                    profileImage: res.properties.profile_image,
                  };

                  // 백엔드 정보 + 카카오 정보 합쳐서 저장
                  const completeUserInfo = {
                    ...backendUserInfo,
                    ...kakaoUserInfo,
                  };

                  localStorage.setItem("user", JSON.stringify(completeUserInfo));
                  setUserInfo(completeUserInfo);
                },
                fail: function (error) {
                  console.error("카카오 사용자 정보 요청 실패", error);
                },
              });
            }
          })
          .catch((error) => {
            if (error.message === "회원가입이 필요합니다.") {
              setNeedsSignup(true);
            } else {
              console.error("로그인 실패", error);
            }
          });
      },
      fail: function (error) {
        console.error("로그인 실패", error);
      },
    });
  };

  const fetchUserInfo = (token) => {
    window.Kakao.API.request({
      url: "/v2/user/me",
      success: function (res) {
        setUserInfo({
          nickname: res.properties.nickname,
          profileImage: res.properties.profile_image,
          userGroup: res.properties.user_group || "기본 그룹",
        });
      },
      fail: function (error) {
        console.error("사용자 정보 요청 실패", error);
      },
    });
  };

  const handleLogout = () => {
    window.Kakao.Auth.logout(function () {
      setUserInfo({});
      setAccessToken("");
      localStorage.removeItem("user");
      console.log(localStorage);
    });
  };

  const handleSignupComplete = () => {
    setNeedsSignup(false);
    fetchUserInfo(accessToken);
  };

  return (
    <div className="App">
      {loading ? (
        <p>로딩 중...</p>
      ) : !userInfo.nickname ? (
        <button onClick={handleLogin}>카카오 로그인</button>
      ) : (
        <>
          <div style={{ marginTop: "20px" }}>
            <h3>로그인한 사용자 정보</h3>
            <p>닉네임: {userInfo.nickname}</p>
            <img src={userInfo.profileImage} alt="프로필" width="100" />
            <br />
            <p>목장: {userInfo.userGroup}</p>
            <br />
            <button onClick={handleLogout}>로그아웃</button>
          </div>
        </>
      )}

      {needsSignup && <SignupForm onSignupComplete={handleSignupComplete} />}
    </div>
  );
};
