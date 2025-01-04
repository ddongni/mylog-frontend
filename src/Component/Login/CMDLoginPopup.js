import React, { useState } from 'react';
import './CMDLoginPopup.css';

function CMDLoginPopup({ onLogin }) {
  const [isNicknameSet, setIsNicknameSet] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleLogin = () => {
    setIsNicknameSet(true); // 로그인 완료 상태로 전환
  };

  const handleConfirm = () => {
    onLogin(inputValue || 'Guest'); // 닉네임 설정
  };

  return (
    <div className="login-popup">
      <h2 className="cmd-title">Login</h2>
      <div className="login-content">
        {!isNicknameSet ? (
          <>
            <button className="cmd-button" onClick={handleLogin}>
              Login
            </button>
          </>
        ) : (
          <>
            <label htmlFor="nickname">Set Nickname:</label>
            <input
              type="text"
              id="nickname"
              className="cmd-input"
              placeholder="Enter your nickname"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
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
