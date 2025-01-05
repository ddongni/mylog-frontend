import React, { useEffect, useRef, useState, useCallback } from 'react';
import './CMDLog.css';
import icons from './icons';
import statusOptions from './status';
import SettingsPopup from '../SettingsPopup/SettingsPopup';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../store/api';
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const formatElapsedTime = (seconds) => {
  // const days = Math.floor(seconds / (24 * 60 * 60));
  // const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  // const minutes = Math.floor((seconds % (60 * 60)) / 60);
  // const remainingSeconds = seconds % 60;

  // if (days > 0) {
  //   return `${days} days ${hours} hours`;
  // } else if (hours > 0) {
  //   return `${hours} hours ${minutes} minutes`;
  // } else if (minutes > 0) {
  //   return `${minutes} minutes`;
  // } else {
  //   return `${remainingSeconds} seconds`;
  // }
};

function CMDLog() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [userStatus, setUserStatus] = useState('online');
  const [userIcon, setUserIcon] = useState(0);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000');
  const [textColor, setTextColor] = useState('lime');
  const logEndRef = useRef(null);
  const { nickname } = useSelector((state) => state.user);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, );

  const animateText = (entry) => {
    const fullText = `${entry.nickname} | ${entry.status} | ${formatElapsedTime(entry.elapsedTime)}`;
    let currentIndex = 0;
  
    const interval = setInterval(() => {
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.nickname === entry.nickname
            ? { ...log, animatedText: fullText.slice(0, currentIndex + 1) }
            : log
        )
      );
  
      currentIndex++;
  
      if (currentIndex >= fullText.length) {
        clearInterval(interval);
        setLogs((prevLogs) =>
          prevLogs.map((log) =>
            log.nickname === entry.nickname
              ? { ...log, animatedText: '' }
              : log
          )
        );
      }
    }, 50); // 애니메이션 속도
  };

  useEffect(() => {
    if(nickname === null) {
      navigate('/login');
    }
  }, [navigate, nickname]);

  useEffect(() => {
    init();
    // const interval = setInterval(() => {
    //   setPeople((prevPeople) =>
    //     prevPeople.map((person) => {
    //       const now = Date.now();
    //       const timeDiff = Math.floor((now - person.updatedAt) / 1000);

    //       return {
    //         ...person,
    //         // elapsedTime: person.animatedText ? person.elapsedTime : person.elapsedTime + timeDiff,
    //         updatedAt: now,
    //       };
    //     })
    //   );
    // }, 1000);

    return () => {
      // clearInterval(interval);
    }
  }, []);

  const init = async () => {
    try {
      const result = await api.get(`/v1/users`);
      const userInfo = result.data;
      setUserIcon(userInfo.emojiCode);
      setUserStatus(userInfo.status);
      if(userInfo.settings.backgroundColor) {
        setBackgroundColor(userInfo.settings.backgroundColor);
      }
      if(userInfo.settings.textColor) {
        setTextColor(userInfo.settings.textColor);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const connectSocket = useCallback(() => {
    const currentNickname = nickname;
    client.current = Stomp.over(() => {
      const sock = new SockJS(`${process.env.REACT_APP_SERVER_URL}/ws-stomp`);
      return sock;
    });

    if (client.current) {
      client.current.connect(
        {},
        () => {
          console.log('WebSocket connected');
          client.current.subscribe('/topic/2025', (message) => {

              const receivedLog = JSON.parse(message.body);
              const newLog = {
                nickname: receivedLog.nickname,
                emojiCode: receivedLog.emojiCode,
                status: receivedLog.status,
                updatedAt: receivedLog.updatedAt
              }
              if (newLog.nickname !== currentNickname) {
                setLogs((prevLog) => {
                  const logIndex = prevLog.findIndex(
                    (log) => log.nickname === newLog.nickname
                  );
                
                  if (logIndex !== -1) {
                    // 같은 닉네임이 있는 경우
                    if (prevLog[logIndex].updatedAt !== newLog.updatedAt) {
                      // updatedAt이 다른 경우 교체 및 마지막으로 이동
                      const updatedLog = [...prevLog];
                      updatedLog.splice(logIndex, 1); // 기존 로그 제거
                      updatedLog.push(newLog); // 새로운 로그를 마지막에 추가
                      return updatedLog;
                    }
                    // updatedAt이 같다면 그대로 유지
                    return prevLog;
                  } else {
                    // 닉네임이 다른 경우 새 로그 추가
                    const updatedLog = [...prevLog, newLog];
                    animateText(newLog); // 새 로그 추가 시 애니메이션 실행
                    return updatedLog;
                  }
                });
              }
          });
        },
        (error) => {
          console.error('WebSocket connection error:', error);
        }
      );
    }
  }, [nickname]);
  

  useEffect(() => {
    getAllLogs();
    connectSocket();

    return () => {
      client.current?.disconnect();
    };
  }, [connectSocket]);


  const selectIcon = (index) => {
    setUserIcon(index);
  };

  const selectStatus = (status) => {
    setUserStatus(status);
  };

  const client = useRef();

  const getAllLogs = async () => {
    try {
      const result = await api.get(`/v1/logs/all`);
      setLogs(result.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const formatToLocalDateTime = (timestamp) => {
    const date = new Date(timestamp);
  
    // 'yyyy-MM-ddTHH:mm:ss' 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const updateLog = () => {
    if (!client.current || !client.current?.connected) {
      console.log("Failed to send a message. Please try again.");
      return;
    }
  
    const newEntry = {
      nickname: nickname,
      emojiCode: userIcon,
      status: userStatus,
      updatedAt: Date.now(), // 현재 시간
    };
  
    // 새 로그 추가 및 최신 로그에 애니메이션 적용
    setLogs((prevLogs) => {
      const filteredLogs = prevLogs.filter((log) => log.nickname !== newEntry.nickname);
      const updatedLogs = [...filteredLogs, newEntry]; // 최신 로그를 배열의 마지막에 추가
      animateText(newEntry); // 최신 로그에만 애니메이션 실행
      return updatedLogs;
    });
  
    // WebSocket 메시지 전송
    if (client.current) {
      client.current.send(
        "/pub/message",
        { "Content-Type": "application/json;charset=UTF-8" },
        JSON.stringify(newEntry)
      );
    } else {
      console.log("Failed to send a message. Please try again.");
    }
  };
  

  return (
    <div className="mylogApp" style={{ backgroundColor: backgroundColor, color: textColor }}>
      <SettingsPopup onChangeBackgroundColor={setBackgroundColor} onChangeTextColor={setTextColor} />
      <div className="log">
        {logs.map((log, index) => (
          <div key={index} className="log-entry">
            <span className="icon">
              <img src={icons[log.emojiCode].url} alt={log.emojiCode} />
            </span>
            {log.animatedText || `${log.nickname} | ${log.status}  | ${formatToLocalDateTime(log.updatedAt)}`}
          </div>
        ))}
        {/* <div ref={logEndRef}></div> */}
        <div className="input-prompt">
          <span className="input-pointer">&gt;</span>
          <span className="icon" onClick={() => setShowIconPicker(true)}>
            <img src={icons[userIcon].url} alt={userIcon} />
          </span>
          {nickname || 'Guest'} |{' '}
          <span onClick={() => setShowStatusPicker(true)}>{userStatus}</span>{' '}
          <button className="common-button" onClick={updateLog}>
            Add to Log
          </button>
          <div className="blinking-cursor" style={{backgroundColor: textColor}}></div>
        </div>
      </div>

      {showIconPicker && (
          <div className="popup-content">
            <h3>Select an Icon</h3>
            <div className="icon-grid">
              {Object.entries(icons).map(([key, icon], index) => (
                <div
                  key={index}
                  className="icon-option"
                  onClick={() => {
                    selectIcon(index);
                    setShowIconPicker(false);
                  }}
                >
                  <img src={icon.url} alt={key} className="icon-image" />
                </div>
              ))}
            </div>
            <button className="close-button" onClick={() => setShowIconPicker(false)}>
              Close
            </button>
          </div>
      )}

      {showStatusPicker && (
          <div className="popup-content">
            <h3>Select a Status</h3>
            <button className="close-button" onClick={() => setShowStatusPicker(false)}>
              Close
            </button>
            <div className="status-grid">
              {statusOptions.map((status, index) => (
                <div
                  key={index}
                  className="status-option"
                  onClick={() => {
                    selectStatus(status);
                    setShowStatusPicker(false);
                  }}
                >
                  {status}
                </div>
              ))}
            </div>
            
          </div>
      )}
    </div>
  );
}

export default CMDLog;
