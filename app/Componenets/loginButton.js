import React from "react";
import dotenv from "dotenv";
import { useAuth } from "../api/server/authContext";

dotenv.config({ path: '../../../.env' });

export const LoginButton = ({ styleClass }) => {

  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <button className={styleClass} onClick={logout}>Logout</button>
      ) : (
        <button className={styleClass} onClick={login}>Login</button>
      )}
    </div>
  );
};