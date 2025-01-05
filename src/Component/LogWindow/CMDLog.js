import React, { useEffect, useRef, useState } from 'react';
import './CMDLog.css';
import icons from './icons';
import SettingsPopup from '../SettingsPopup/SettingsPopup';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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

function CMDLog() {
  const navigate = useNavigate();
  const [people, setPeople] = useState([
    { id: 1, name: 'Jeongwook', status: 'running', icon: 'dizzy', elapsedTime: 2, lastUpdated: Date.now(), animatedText: '' },
    { id: 2, name: 'Alice', status: 'thinking', icon: 'thinking', elapsedTime: 3, lastUpdated: Date.now(), animatedText: '' },
  ]);
  const [userStatus, setUserStatus] = useState('online');
  const [userIcon, setUserIcon] = useState('neutral');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [logColor, setLogColor] = useState('#000');
  const [textColor, setTextColor] = useState('lime');
  const logEndRef = useRef(null);
  const nextId = useRef(3);
  const { nickname } = useSelector((state) => state.user);

  const statusOptions = [
    'online', 'chatting', 'typing', 'smiling', 'laughing', 'thinking',
    'working', 'studying', 'coding', 'cleaning', 'shopping',
    'eating', 'drinking', 'cooking', 'traveling', 'driving', 
    'walking', 'running', 'exercising', 'swimming', 'hiking',
    'gardening', 'painting', 'gaming', 'fishing', 
    'sleeping', 'relaxing', 'crying', 'angry', 'showering', 'dancing',
];

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, );

  const addUserToLog = () => {
    const newEntry = {
      id: nextId.current++,
      name: nickname || 'Guest',
      status: userStatus,
      icon: userIcon,
      elapsedTime: 0,
      lastUpdated: Date.now(),
      animatedText: '',
    };

    setPeople((prevPeople) => {
      const updatedPeople = [...prevPeople, newEntry];
      animateText(newEntry);
      return updatedPeople;
    });
  };

  const animateText = (entry) => {
    const fullText = `${entry.name} | ${entry.status} | ${formatElapsedTime(entry.elapsedTime)}`;
    let currentIndex = 0;

    const interval = setInterval(() => {
      setPeople((prevPeople) =>
        prevPeople.map((person) =>
          person.id === entry.id
            ? { ...person, animatedText: fullText.slice(0, currentIndex + 1) }
            : person
        )
      );

      currentIndex++;

      if (currentIndex >= fullText.length) {
        clearInterval(interval);
        setPeople((prevPeople) =>
          prevPeople.map((person) =>
            person.id === entry.id
              ? { ...person, animatedText: '', lastUpdated: Date.now() }
              : person
          )
        );
      }
    }, 50);
  };

  useEffect(() => {
    if(nickname === null) {
      navigate('/login');
    }
  }, [navigate, nickname]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPeople((prevPeople) =>
        prevPeople.map((person) => {
          const now = Date.now();
          const timeDiff = Math.floor((now - person.lastUpdated) / 1000);

          return {
            ...person,
            elapsedTime: person.animatedText ? person.elapsedTime : person.elapsedTime + timeDiff,
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
        {people.map((person) => (
          <div key={person.id} className="log-entry">
            <span className="icon">
              <img src={icons[person.icon]} alt={person.icon} />
            </span>
            {person.animatedText || `${person.name} | ${person.status} | ${formatElapsedTime(person.elapsedTime)}`}
          </div>
        ))}
        <div ref={logEndRef}></div>
        <div className="input-prompt">
          <span className="input-pointer">&gt;</span>
          <span className="icon" onClick={() => setShowIconPicker(true)}>
            <img src={icons[userIcon]} alt={userIcon} />
          </span>
          {nickname || 'Guest'} |{' '}
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
