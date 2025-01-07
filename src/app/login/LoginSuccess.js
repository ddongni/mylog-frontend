import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setNickname } from '../../store/slices/userSlice';

const LoginSuccess = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const nickname = params.get('nickname');

    useEffect(() => {
       const updateNicknameAndNavigate = async () => {
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
    }, [dispatch, navigate, nickname]);

    
    return (
        <></>
    );
}

export default LoginSuccess;