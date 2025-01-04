import React from 'react';
import './CMDLoginPopup.css';

function CMDLoginPopup() {
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const handleLogin = () => {
    window.location.href = serverUrl + '/oauth2/authorization/google';
  };

  return (
    <div className="login-popup">
      <h2 className="cmd-title">Login</h2>
      <div className="login-content">
        <button className="cmd-button" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default CMDLoginPopup;
