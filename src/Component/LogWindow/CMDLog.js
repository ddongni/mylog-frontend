import React, { useEffect, useRef, useState } from 'react';
import './CMDLog.css';
import icons from './icons';
import SettingsPopup from '../SettingsPopup/SettingsPopup';

const formatElapsedTime = (seconds) => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return `${days} days ${hours} hours`;
  } else if (hours > 0) {
    return `${hours} hours ${minutes} minutes`;
  } else if (minutes > 0) {
    return `${minutes} minutes`;
  } else {
    return `${remainingSeconds} seconds`;
  }
};

function CMDLog({ userId }) {
  const [people, setPeople] = useState([
    { name: 'Jeongwook', status: 'running', icon: '🏃', elapsedTime: 2, lastUpdated: Date.now() },
    { name: 'Alice', status: 'thinking', icon: '🤔', elapsedTime: 3, lastUpdated: Date.now() },
  ]);
  const [userStatus, setUserStatus] = useState('online');
  const [userIcon, setUserIcon] = useState('😊');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [logColor, setLogColor] = useState('#000');
  const [textColor, setTextColor] = useState('lime');
  const logEndRef = useRef(null);

  const statusOptions = ['online', 'coding', 'relaxing', 'sleeping', 'working', 'eating', 'drinking', 'exercising', 'shopping', 'traveling', 'cleaning', 'studying', 'chatting', 'driving', 'walking', 'running', 'swimming', 'thinking', 'angry', 'crying', 'smiling', 'laughing', 'showering', 'typing', 'hiking', 'fishing', 'gaming', 'painting', 'gardening', 'dancing'];

  // 초기 렌더링과 로그 추가 시에만 스크롤
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const addUserToLog = () => {
    setPeople((prevPeople) => [
      ...prevPeople,
      { name: userId || 'Guest', status: userStatus, icon: userIcon, elapsedTime: 0, lastUpdated: Date.now() },
    ]);

    // 로그 추가 후에만 스크롤
    setTimeout(() => {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  // 매 초마다 경과 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setPeople((prevPeople) =>
        prevPeople.map((person) => {
          const now = Date.now();
          const timeDiff = Math.floor((now - person.lastUpdated) / 1000);
          return {
            ...person,
            elapsedTime: person.elapsedTime + timeDiff,
            lastUpdated: now,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const selectIcon = (icon) => {
    setUserIcon(icon);
  };

  const selectStatus = (status) => {
    setUserStatus(status);
  };

  return (
    <div className="mylogApp" style={{ backgroundColor: logColor, color: textColor }}>
      <SettingsPopup
        onChangeBackgroundColor={setLogColor}
        onChangeTextColor={setTextColor}
      />
      <div className="log">
        {people.map((person, index) => (
          <div key={index} className="log-entry">
            <span className="icon">{person.icon || icons[person.status] || '❓'}</span>
            {person.name} | {person.status} | {formatElapsedTime(person.elapsedTime)}
          </div>
        ))}
        <div ref={logEndRef}></div>
        <div className="input-prompt">
          <span className="icon" onClick={() => setShowIconPicker(true)}>
            {userIcon}
          </span>
          {userId || 'Guest'} |{' '}
          <span onClick={() => setShowStatusPicker(true)}>{userStatus}</span>{' '}
          <button className="common-button" onClick={addUserToLog}>Add to Log</button>
          <span className="blinking-cursor" style={{ backgroundColor: textColor }}></span>
        </div>
      </div>

      {showIconPicker && (
        <div className="popup">
          <div className="popup-content">
            <h3>Select an Icon</h3>
            <div className="icon-grid">
              {Object.values(icons).map((icon, index) => (
                <span
                  key={index}
                  className="icon-option"
                  onClick={() => {
                    selectIcon(icon);
                    setShowIconPicker(false);
                  }}
                >
                  {icon}
                </span>
              ))}
            </div>
            <button className="common-button" onClick={() => setShowIconPicker(false)}>Close</button>
          </div>
        </div>
      )}

      {showStatusPicker && (
        <div className="popup">
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
            <button className="common-button" onClick={() => setShowStatusPicker(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CMDLog;
