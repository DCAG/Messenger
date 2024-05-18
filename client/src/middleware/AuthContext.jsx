// ref: https://dev.to/stephengade/build-custom-middleware-for-a-reactnextjs-app-with-context-api-2ed3
import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const hasAccess = sessionStorage['accessToken']

    if (hasAccess) {
      setIsAuthenticated(true);
    }
  }, [])

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