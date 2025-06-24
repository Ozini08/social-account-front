// MemberContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

const MemberContext = createContext();

export const LoginMemberProvider = ({ children }) => {
  useEffect(() => {
    fetch("http://localhost:8080/api/csrf", {
      method: "GET",
      credentials: "include", // 반드시 필요!
    }).then(() => {
      console.log("CSRF 쿠키 수신 완료:", document.cookie);
    });
  }, []);
  const [loginMember, setLoginMember] = useState(null); // null로 초기화
  const [loading, setLoading] = useState(true);

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };
  console.log(getCookie("XSRF-TOKEN"));
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/kakao/user-info", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setLoginMember(data);
        } else {
          // access_token 만료되었으면 refresh
          const refreshRes = await fetch("http://localhost:8080/api/kakao/token/refresh", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
            },
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            console.log("토큰 재발급 성공", refreshData);
            fetchUserInfo(); // 재시도
          } else {
            setLoginMember(null); // 재발급 실패
          }
        }
      } catch (err) {
        console.error("로그인 상태 확인 실패", err);
        setLoginMember(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <MemberContext.Provider value={{ loginMember, setLoginMember, loading }}>
      {children}
    </MemberContext.Provider>
  );
};

export const useLoginMember = () => useContext(MemberContext);
