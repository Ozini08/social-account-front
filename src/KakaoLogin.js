import { useState, useEffect } from "react";
import { SignupForm } from "./SignupForm";

export const KakaoLogin = () => {
  const [userInfo, setUserInfo] = useState(null); // 빈 객체 대신 null로 초기화
  const [needsSignup, setNeedsSignup] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [redisMessage, setRedisMessage] = useState("");

  useEffect(() => {
    // Redis 값 불러오기
    fetch("http://localhost:8080/api/redis-test", {
      credentials: "include",
    })
      .then((res) => res.text()) // 응답이 단순 문자열이므로 .text()
      .then((message) => {
        setRedisMessage(message); // ✅ 상태 저장
      })
      .catch((err) => {
        console.error("Redis 값 불러오기 실패", err);
      });

    fetch("http://localhost:8080/api/kakao/user-info", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error("Not logged in");
      })
      .then((data) => {
        console.log(data);
        setUserInfo(data);
      })
      .catch(() => {
        setUserInfo(null);
      });
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      const kakaoApiKey = process.env.REACT_APP_KAKAO_API_KEY;
      if (window.Kakao) {
        window.Kakao.init(kakaoApiKey);
        console.log("카카오 SDK 초기화 완료");
      } else {
        console.error("카카오 SDK 로드 실패");
      }
    };
    document.body.appendChild(script);

    setLoading(false);

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
          credentials: "include",
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
            console.log(data);
            if (data.member) {
              const backendUserInfo = {
                nickname: data.member.nickname,
                profileImage: data.member.profileImageUrl,
                userGroup: data.member.userGroup,
                auth: data.member.auth,
              };
              setUserInfo(backendUserInfo); // 상태만 저장
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
      },
      fail: function (error) {
        console.error("로그인 실패", error);
      },
    });
  };

  const handleLogout = () => {
    window.Kakao.Auth.logout(function () {
      fetch("http://localhost:8080/api/kakao/logout", {
        method: "POST",
        credentials: "include",
      })
        .then(() => {
          setUserInfo(null);
          setAccessToken("");
        })
        .catch((error) => {
          console.error("로그아웃 실패", error);
        });
    });
  };

  const handleSignupComplete = () => {
    setNeedsSignup(false);
    // 회원가입 완료 후 재로그인 로직 필요하면 여기서 넣기
  };

  return (
    <div className="App">
      {loading ? (
        <p>로딩 중...</p>
      ) : !userInfo ? (
        <button onClick={handleLogin}>카카오 로그인</button>
      ) : (
        <>
          <div style={{ marginTop: "20px" }}>
            <h3>로그인한 사용자 정보</h3>
            <p>닉네임: {userInfo.nickname}</p>
            <img src={userInfo.profileImage} alt="프로필" width="100" />
            <br />
            <button onClick={handleLogout}>로그아웃</button>
          </div>
        </>
      )}
      <div style={{ marginTop: "20px" }}>
        <h3>Redis에서 가져온 메시지</h3>
        <p>{redisMessage}</p>
      </div>
      {needsSignup && <SignupForm onSignupComplete={handleSignupComplete} />}
    </div>
  );
};
