import React, { useEffect } from 'react';
import './CMDLoginPopup.css';
import { useDispatch } from 'react-redux';
import { setNickname } from '../../store/slices/userSlice';

function CMDLoginPopup() {
  const dispatch = useDispatch();

  const serverUrl = "https://mylogapi.brokers-x.com";

  const handleLogin = () => {
    window.location.href = serverUrl + '/oauth2/authorization/google';
  };

  useEffect(() => {
    const updateUser = async () => {
      await dispatch(setNickname(null));
    };

    updateUser();
  }, [dispatch]);

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
