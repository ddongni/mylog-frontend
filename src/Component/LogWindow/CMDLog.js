import React, { useState } from 'react';
import './CMDLog.css';
import icons from './icons';
import SettingsPopup from '../SettingsPopup/SettingsPopup';

function CMDLog({ userId }) {
  const [logColor, setLogColor] = useState('#000');
  const [textColor, setTextColor] = useState('lime');

  const people = [
    { name: 'Jeongwook', status: 'running', elapsedTime: '2.00 seconds' },
    { name: 'Alice', status: 'thinking', elapsedTime: '3.50 seconds' },
    { name: 'Bob', status: 'coding', elapsedTime: '1.25 seconds' },
    { name: 'Charlie', status: 'chatting', elapsedTime: '4.00 seconds' },
    { name: 'Dana', status: 'sleeping', elapsedTime: '6.20 seconds' },
  ];

  return (
    <div
      className="mylogApp"
      style={{ backgroundColor: logColor, color: textColor }}
    >
      <SettingsPopup
        onChangeBackgroundColor={setLogColor}
        onChangeTextColor={setTextColor}
      />
      <div className="log">
        {people.map((person, index) => (
          <div key={index} className="log-entry">
            <span className="icon">{icons[person.status] || '❓'}</span>
            {person.name} | {person.status} | {person.elapsedTime}
          </div>
        ))}
        <div className="input-prompt">
          {userId || 'Guest'} <span className="blinking-cursor" style={{ backgroundColor: textColor }}></span>
        </div>
      </div>
    </div>
  );
}

export default CMDLog;
