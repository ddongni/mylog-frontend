import React from 'react';
import './CMDLoginPopup.css';

function CMDLoginPopup() {
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const handleLogin = () => {
    window.location.href = serverUrl + '/oauth2/authorization/google';
  };

  return (
    <div className="login-popup">
      <div className="login-content">
        <h3>Simplify your day, log yourself.</h3>
        <button className="cmd-button" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default CMDLoginPopup;
