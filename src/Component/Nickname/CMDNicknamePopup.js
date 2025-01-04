import React, { useState } from 'react';
import './CMDNicknamePopup.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateNickname, setNickname } from '../../store/slices/userSlice';

function CMDNicknamePopup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = async() => {
    try {
      await dispatch(updateNickname(inputValue)).unwrap();
      await dispatch(setNickname(inputValue));
      navigate('/');
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  return (
    <div className="nickname-popup">
      <h2 className="cmd-title">Nickname</h2>
      <div className="nickname-content">
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
      </div>
    </div>
  );
}

export default CMDNicknamePopup;
