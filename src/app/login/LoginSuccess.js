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

    const getEmailFromCookies = async () => {
        return new Promise((resolve, reject) => {
            try {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; email=`);
                if (parts.length === 2) {
                    const email = parts.pop().split(';').shift();
                    resolve(email); // 이메일 반환
                } else {
                    resolve(null); // 이메일이 없을 경우 null 반환
                }
            } catch (error) {
                reject(error); // 에러 발생 시 reject
            }
        });
    };

    useEffect(() => {
       const updateNicknameAndNavigate = async () => {
            if (nickname && nickname.length > 0) {
                try {
                    await dispatch(setNickname(nickname));

                    const email = await getEmailFromCookies();
                    if (email) {
                        localStorage.setItem("email", email);
                    }
                    
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