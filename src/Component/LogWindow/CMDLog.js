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

  const getElapsedTime = (updatedAt) => {
    const updatedDate = new Date(updatedAt+'Z');
    const nowUtc = new Date();
    const diffMs = nowUtc.getTime() - updatedDate.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
  
    if (diffSeconds < 60) {
      return `${diffSeconds} s`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes} m `;
    } else if (diffHours < 24) {
      return `${diffHours} h `;
    } else {
      return `${diffDays} d`;
    }
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, );

  const animateText = (entry) => {
    const fullText = `${entry.nickname} | ${entry.status} | ${getElapsedTime(entry.updatedAt)}`;
    let currentIndex = 0;
  
    const interval = setInterval(() => {
      setLogs((prevLog) =>
        prevLog.map((log) =>
          log.nickname === entry.nickname
            ? { ...log, animatedText: fullText.slice(0, currentIndex + 1) }
            : log
        )
      );
  
      currentIndex++;
  
      if (currentIndex >= fullText.length) {
        clearInterval(interval);
  
        // 애니메이션이 끝난 후 elapsedTime 업데이트 복원
        setLogs((prevLog) =>
          prevLog.map((log) =>
            log.nickname === entry.nickname
              ? { ...log, animatedText: null } // animatedText 제거
              : log
          )
        );
      }
    }, 50);
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.animatedText
            ? log // 애니메이션 중인 항목은 무시
            : { ...log, elapsedTime: getElapsedTime(log.updatedAt) }
        )
      );
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);
  

  useEffect(() => {
    init();

    if(nickname === null) {
      navigate('/login');
    }

    const interval = setInterval(() => {
      setLogs((prevLogs) =>
        prevLogs.map((log) => ({
          ...log,
          elapsedTime: getElapsedTime(log.updatedAt),
        }))
      );
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);

  const init = async () => {
    try {
      const result = await api.get(`/v1/users`);
      const userInfo = result.data;
      setUserIcon(userInfo.emojiCode);
      setUserStatus(userInfo.status);
      if(userInfo.settings?.backgroundColor) {
        setBackgroundColor(userInfo.settings.backgroundColor);
      }
      if(userInfo.settings?.textColor) {
        setTextColor(userInfo.settings.textColor);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      if(error.message === 'Network Error'){
        navigate('/login');
      }
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
                updatedAt: receivedLog.updatedAt,
                // elapsedTime: getElapsedTime(receivedLog.updatedAt)
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
      if(error.message === 'Network Error'){
        navigate('/login');
      }
    }
  };

  const formatToUTCDateTime = (timestamp) => {
    const date = new Date(timestamp);
  
    // Get the UTC components of the date
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
    // Return the formatted UTC date with a 'Z' indicating UTC timezone
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const updateLog = () => {
    if (!client.current || !client.current?.connected) {
      console.log("Failed to send a message. Please try again.");
      return;
    }
    // TODO: 유효성 검사

    const now = Date.now();
    const newEntry = {
      nickname: nickname,
      emojiCode: userIcon,
      status: userStatus,
      updatedAt: formatToUTCDateTime(now),
    };

    setLogs((prevLog) => {
      const updatedLog = prevLog.filter((log) => log.nickname !== newEntry.nickname);
      const newLogs = [...updatedLog, newEntry];
      animateText(newEntry);
      return newLogs;
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
              <img src={icons[log.emojiCode]?.url} alt={log.emojiCode} />
            </span>
          {log.animatedText || `${log.nickname} | ${log.status} | ${getElapsedTime(log.updatedAt)}`}
          </div>
        ))}
        {/* <div ref={logEndRef}></div> */}
        <div className="input-prompt">
          <span className="input-pointer">&gt;</span>
          <span className="icon" onClick={() => setShowIconPicker(true)}>
            <img src={icons[userIcon]?.url} alt={userIcon} />
          </span>
          {nickname || 'Guest'} | {' '}
          <span className="status" onClick={() => setShowStatusPicker(true)}>{userStatus}</span>
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
