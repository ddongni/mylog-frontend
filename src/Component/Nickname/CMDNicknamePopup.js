import React, { useState } from 'react';
import './CMDNicknamePopup.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { updateNickname, setNickname } from '../../store/slices/userSlice';

function CMDNicknamePopup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState('');
  const [errorMassage, setErrorMassage] = useState('');

  const prohibitedWords = [
    "idiot", "stupid", "dumb", "moron", "fool", "bastard", "jerk", 
    "loser", "scumbag", "trash", "garbage", "suck", "nasty", 
    "creep", "pervert", "psycho", "clown", "weirdo", "lunatic", 
    "imbecile", "slut", "whore", "prostitute", "pig", "dog", 
    "coward", "scum", "monster", "evil", "hate", "crap", "hell", 
    "damn", "ugly", "fat", "disgusting", "gross", "pathetic", 
    "lazy", "useless", "failure", "annoying", "burden", "troublemaker", 
    "toxic", "bitter", "abuser", "liar", "cheater", "selfish", 
    "manipulator"
  ];
  
  const handleInputChange = (e) => {
    const value = e.target.value;

    // 유효성 검사: 띄어쓰기 금지, 15글자 제한, 욕설 필터링
    if (value.length > 15) {
      setErrorMassage("It's too long...");
    } else if (/\s/.test(value)) {
      setErrorMassage("Spaces are not allowed.");
    } else if (prohibitedWords.some((word) => value.toLowerCase().includes(word))) {
      setErrorMassage("Inappropriate words are not allowed.");
    } else {
      setErrorMassage(''); // 에러 메시지 초기화
    }

    setInputValue(value);
  };

  const handleConfirm = async () => {
    if (errorMassage || inputValue.length === 0) {
      return; // 에러가 있거나 입력값이 비어있을 경우 실행 중지
    }

    try {
      await dispatch(updateNickname({
        nickname: inputValue
      })).unwrap();
      await dispatch(setNickname(inputValue));
      navigate('/');
    } catch (error) {
      if(error.message === 'Request failed with status code 409') {
        setErrorMassage('nickname is already taken');
      }
      if(error.status === 403){
        navigate('/login?auth=expired');
      }
    }
  };

  const userNickname = useSelector((state) => state.user.nickname);

  return (
    <div className="nickname-popup">
      <h2 className="cmd-title">Nickname</h2>
      <div className="nickname-content">
        <p className="cmd-error">{errorMassage}</p>
        <input
          type="text"
          id="nickname"
          className="cmd-input"
          placeholder="Enter your nickname"
          value={inputValue}
          onChange={handleInputChange}
        />
        {userNickname ? (
          <button className="close-button" onClick={() => navigate('/')}>
            Go Back
          </button>
        ) : null}
        <button className="cmd-button" onClick={handleConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
}

export default CMDNicknamePopup;
