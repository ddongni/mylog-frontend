/* eslint-disable */
import React, { useEffect, useRef, useState, useCallback, use } from 'react';
import './CMDLog.css';
import icons from './icons';
import statusOptions from './status';
import SettingsPopup from '../SettingsPopup/SettingsPopup';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from 'axios';
import ReactDOM from 'react-dom';

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
  const [loading, setLoading] = useState(true);

  const dummyData = {
    nickname: "mylog",
    status: "in operation",
    updatedAt: "2025-01-04T07:00:00.000Z", // 올바른 ISO 시간
  };

  const getElapsedTime = (updatedAt, isDummy = false) => {
    const updatedDate = new Date(updatedAt + 'Z');
    const nowUtc = new Date();
    
     // 더미 데이터일 경우 특별 처리
  if (isDummy) {
    const updatedDate = new Date(updatedAt);
    const nowUtc = new Date();

    const diffMs = nowUtc.getTime() - updatedDate.getTime();

    if (diffMs < 0) {
      return "0 s"; // 음수 값 방지
    }

    const diffSeconds = Math.floor(diffMs / 1000) % 60;
    const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} d ${diffHours} h`;
    } else if (diffHours > 0) {
      return `${diffHours} h ${diffMinutes} m`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} m ${diffSeconds} s`;
    } else {
      return `${diffSeconds} s`;
    }
  }

    //시간 테스트하기 위한 코드임
    // nowUtc.setSeconds(nowUtc.getSeconds() + 50); // 초 추가
    // nowUtc.setMinutes(nowUtc.getMinutes() + 59); // 분 추가
    // nowUtc.setHours(nowUtc.getHours() + 23); // 시간 추가

    const diffMs = nowUtc.getTime() - updatedDate.getTime();

    if (isNaN(diffMs)) {
      return "Invalid time"; // 계산 오류 방지
    }
  
    const diffSeconds = Math.floor(diffMs / 1000) % 60; // 초 단위의 나머지 값 계산
    const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60; // 분 단위의 나머지 값 계산
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60)) % 24; // 시간 단위의 나머지 값 계산
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // 일 단위 계산
  
    if (diffDays > 0) {
      return `${diffDays} d ${diffHours} h`;
    } else if (diffHours > 0) {
      return `${diffHours} h ${diffMinutes} m`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} m ${diffSeconds} s`;
    } else {
      return `${diffSeconds} s`;
    }
  };
  
  

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
        prevLogs && prevLogs.map((log) =>
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
    setTimeout(() => {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 1500);

    if(nickname === null) {
      navigate('/login');
    }

    const interval = setInterval(() => {
      setLogs((prevLogs) =>
        prevLogs && prevLogs.map((log) => ({
          ...log,
          elapsedTime: getElapsedTime(log.updatedAt),
        }))
      );
    }, 1000);
    
    return () => clearInterval(interval);
    
  }, []);

  
  const init = async () => {
    try {
      const result = await axios.get(`${process.env.REACT_APP_SERVER_URL}/v1/users/init`,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true,
        }
      );
      const userInfo = result.data;
      setUserIcon(userInfo.emojiCode || 0);
      setUserStatus(userInfo.status || 'online');
      if(userInfo.settings?.backgroundColor) {
        setBackgroundColor(userInfo.settings.backgroundColor);
      }
      if(userInfo.settings?.textColor) {
        setTextColor(userInfo.settings.textColor);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      if(error.status === 403){
        navigate('/login?auth=expired');
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
          setLoading(false);
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
          console.error('Failed to connect WebSocket:', error);
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
      const result = await axios.get(`${process.env.REACT_APP_SERVER_URL}/v1/logs/all`, {
        withCredentials: true,
      });
      setLogs(result.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      if(error.status === 403){
        navigate('/login?auth=expired');
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
    <div>
    <div className="mylogApp" style={{ backgroundColor: backgroundColor, color: textColor }}>
      {/* 메인 컨텐츠 */}
      <SettingsPopup onChangeBackgroundColor={setBackgroundColor} onChangeTextColor={setTextColor} />
      <div className="log">
        <div className="log-entry">
          <span className="icon">
            <img src="/mylog-admin.png" alt="dummy-icon" />
          </span>
          {dummyData.nickname} | {dummyData.status} | {getElapsedTime(dummyData.updatedAt, true)}
        </div>
        {logs && logs.map((log, index) => (
          <div key={index} className="log-entry">
            <span className="icon">
              <img src={icons[log.emojiCode]?.url} alt={log.emojiCode} />
            </span>
            {log.animatedText || `${log.nickname} | ${log.status} | ${getElapsedTime(log.updatedAt)}`}
          </div>
        ))}
        <div className="input-prompt">
          <span className="input-pointer">&gt;</span>
          <span className="icon" onClick={() => setShowIconPicker(true)}>
            <img src={icons[userIcon]?.url} alt={userIcon} />
          </span>
          {nickname || 'Guest'} | {' '}
          <span className="status" onClick={() => setShowStatusPicker(true)}>
            {userStatus}
          </span>
          {loading?
          <>
          <div className="connecting-front">{' | '}</div>
          <div className="connecting" style={{ color: textColor }}>Connecting...</div>
          </>
          :
          <>
          <button className="common-button" onClick={updateLog}>
            Add to Log
          </button>
          <div className="blinking-cursor" style={{ backgroundColor: textColor }}></div>
          </>}
        </div>
      </div>
    </div>

    {/* Icon Picker Popup */}
    {showIconPicker &&
      ReactDOM.createPortal(
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
        </div>,
        document.body
      )}

    {/* Status Picker Popup */}
    {showStatusPicker &&
      ReactDOM.createPortal(
        <div className="popup-content">
          <h3>Select a Status</h3>
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
          <button className="close-button" onClick={() => setShowStatusPicker(false)}>
            Close
          </button>
        </div>,
        document.body
      )}
  </div>

  );
}

export default CMDLog;
