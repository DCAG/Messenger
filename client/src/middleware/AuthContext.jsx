// ref: https://dev.to/stephengade/build-custom-middleware-for-a-reactnextjs-app-with-context-api-2ed3
import React, { createContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const hasAccess = sessionStorage['accessToken']

    if (hasAccess) {
      setIsAuthenticated(true);
    }
  }, [])

  useEffect(() => {
    if(!sessionStorage['accessToken'] && !location.pathname.endsWith('login')){
      navigate('/login')
    }
  },[location,isAuthenticated])

  const loginUser = (accessToken, userData) => {
    sessionStorage['accessToken'] = accessToken
    // splat userData into sessionStorage
    Object.keys(userData).forEach(key => {
      sessionStorage[key] = userData[key]
    })
    setIsAuthenticated(true)
  }

  const logoutUser = () => {
    sessionStorage.clear()
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };