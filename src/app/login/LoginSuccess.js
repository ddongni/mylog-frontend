import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setNickname, setEmail } from '../../store/slices/userSlice';

const LoginSuccess = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const nickname = params.get('nickname');
    const email = params.get('email');

    useEffect(() => {
       const updateNicknameAndNavigate = async () => {
            if(email) {
                try {
                    await dispatch(setEmail(email));
                } catch (error) {
                    console.error('Email update failed:', error);
                }
            }
            if (nickname && nickname.length > 0) {
                try {
                    await dispatch(setNickname(nickname));
                    
                    navigate('/');
                } catch (error) {
                    console.error('Nickname update failed:', error);
                }
            } else {
                navigate('/nickname');
            }
        };

        updateNicknameAndNavigate();
    }, [dispatch, navigate, nickname, email]);

    
    return (
        <></>
    );
}

export default LoginSuccess;