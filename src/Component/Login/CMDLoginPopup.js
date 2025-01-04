import React, { useState } from 'react';
import './CMDLoginPopup.css';

function CMDLoginPopup({ onLogin }) {
  const [inputValue, setInputValue] = useState('');
  const [isNicknameSet, setIsNicknameSet] = useState(false);

  const handleLogin = () => {
    setIsNicknameSet(true); // 닉네임 설정 상태로 변경
  };

  const handleConfirm = () => {
    onLogin(inputValue || 'Guest'); // 닉네임 전달
  };

  return (
    <div className="login-popup">
      <h2 className="cmd-title">Login</h2>
      <div className="login-content">
        {!isNicknameSet ? (
          <>
            <label htmlFor="username">Enter Username:</label>
            <input
              type="text"
              id="username"
              className="cmd-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="cmd-button" onClick={handleLogin}>
              Set Nickname
            </button>
          </>
        ) : (
          <>
            <p>Nickname: {inputValue || 'Guest'}</p>
            <button className="cmd-button" onClick={handleConfirm}>
              Confirm
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CMDLoginPopup;
