// MemberContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { csrfFetch } from "./csrfFetch";

const MemberContext = createContext();

export const LoginMemberProvider = ({ children }) => {
  useEffect(() => {
    fetch("/api/csrf", {
      method: "GET",
      credentials: "include", // 반드시 필요!
    }).then(() => {
      console.log("CSRF 쿠키 수신 완료:", document.cookie);
    });
  }, []);
  const [loginMember, setLoginMember] = useState(null); // null로 초기화
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await csrfFetch("/api/kakao/user-info", {
          method: "GET",
        });

        if (res.ok) {
          const data = await res.json();
          setLoginMember(data);
        } else {
          // access_token 만료되었으면 refresh
          const refreshRes = await csrfFetch("/api/kakao/token/refresh", {
            method: "POST",
          });

          if (refreshRes.ok) {
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
