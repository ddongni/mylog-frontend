import React, { useState } from 'react';
import './CMDLoginPopup.css';

function CMDLoginPopup({ onLogin }) {
  const [inputValue, setInputValue] = useState('');

  const handleLogin = () => {
    onLogin(inputValue || 'Guest');
  };

  return (
    <div className="login-popup">
      <h2 className="cmd-title">Login</h2>
      <div className="login-content">
        <label htmlFor="username">Enter Username:</label>
        <input
          type="text"
          id="username"
          className="cmd-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div className="button-group">
          <button className="cmd-button" onClick={handleLogin}>
            Login
          </button>
          <button className="cmd-button" onClick={() => onLogin('Guest')}>
            Login as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

export default CMDLoginPopup;
