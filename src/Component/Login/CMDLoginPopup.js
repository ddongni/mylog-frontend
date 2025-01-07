import React, { useEffect } from 'react';
import './CMDLoginPopup.css';
import { useDispatch } from 'react-redux';
import { setNickname } from '../../store/slices/userSlice';
import { useLocation } from 'react-router-dom';

function CMDLoginPopup() {
  const dispatch = useDispatch();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const isAuthExpired = params.get('auth');

  const serverUrl = process.env.REACT_APP_SERVER_URL;

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
        {isAuthExpired ? <p className="warnning">Your session has expired. Please log in again.</p> : <></>}
        <button className="cmd-button" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default CMDLoginPopup;
