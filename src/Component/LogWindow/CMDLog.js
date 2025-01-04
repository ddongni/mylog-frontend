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
    { name: 'Jeongwook', status: 'running', icon: 'dizzy', elapsedTime: 2, lastUpdated: Date.now(), animatedText: '' },
    { name: 'Alice', status: 'thinking', icon: 'thinking', elapsedTime: 3, lastUpdated: Date.now(), animatedText: '' },
  ]);
  const [userStatus, setUserStatus] = useState('online');
  const [userIcon, setUserIcon] = useState('neutral'); // 기본 아이콘
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [logColor, setLogColor] = useState('#000');
  const [textColor, setTextColor] = useState('lime');
  const logEndRef = useRef(null);

  const statusOptions = ['online', 'coding', 'relaxing', 'sleeping', 'working', 'eating', 'drinking', 'exercising', 'shopping', 'traveling', 'cleaning', 'studying', 'chatting', 'driving', 'walking', 'running', 'swimming', 'thinking', 'angry', 'crying', 'smiling', 'laughing', 'showering', 'typing', 'hiking', 'fishing', 'gaming', 'painting', 'gardening', 'dancing'];

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [people]);

  const addUserToLog = () => {
    const newEntry = {
      name: userId || 'Guest',
      status: userStatus,
      icon: userIcon,
      elapsedTime: 0,
      lastUpdated: Date.now(),
      animatedText: '',
    };

    setPeople((prevPeople) => [...prevPeople, newEntry]);

    // 타이핑 애니메이션 시작
    animateText(newEntry);
  };

  const animateText = (entry) => {
    const fullText = `${entry.name} | ${entry.status} | ${formatElapsedTime(entry.elapsedTime)}`;
    let currentIndex = 0;
  
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setPeople((prevPeople) =>
          prevPeople.map((person) =>
            person.name === entry.name && person.status === entry.status
              ? { ...person, animatedText: fullText.slice(0, currentIndex + 1) }
              : person
          )
        );
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50); // 타이핑 속도
  };
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
      <SettingsPopup onChangeBackgroundColor={setLogColor} onChangeTextColor={setTextColor} />
      <div className="log">
        {people.map((person, index) => (
          <div key={index} className="log-entry">
            <span className="icon">
              <img src={icons[person.icon]} alt={person.icon} />
            </span>
            {person.animatedText || `${person.name} | ${person.status} | ${formatElapsedTime(person.elapsedTime)}`}
          </div>
        ))}
        <div ref={logEndRef}></div>
        <div className="input-prompt">
          <span className="icon" onClick={() => setShowIconPicker(true)}>
            <img src={icons[userIcon]} alt={userIcon} />
          </span>
          {userId || 'Guest'} |{' '}
          <span onClick={() => setShowStatusPicker(true)}>{userStatus}</span>{' '}
          <button className="common-button" onClick={addUserToLog}>
            Add to Log
          </button>
          <div className="blinking-cursor"></div>
        </div>
      </div>

      {showIconPicker && (
        <div className="popup">
          <div className="popup-content">
            <h3>Select an Icon</h3>
            <div className="icon-grid">
              {Object.entries(icons).map(([key, icon], index) => (
                <div
                  key={index}
                  className="icon-option"
                  onClick={() => {
                    selectIcon(key);
                    setShowIconPicker(false);
                  }}
                >
                  <img src={icon} alt={key} className="icon-image" />
                </div>
              ))}
            </div>
            <button className="common-button" onClick={() => setShowIconPicker(false)}>
              Close
            </button>
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
            <button className="common-button" onClick={() => setShowStatusPicker(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CMDLog;
