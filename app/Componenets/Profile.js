import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Profile({ styleClass }) {
  const { user, isAuthenticated } = useAuth0();


  return (
    isAuthenticated && (
      // <div className={styleClass}>
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );

};