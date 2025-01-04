import React from 'react';
import './CMDLog.css';

function CMDLog({ userId }) {
  const people = [
    { name: 'Jeongwook', status: 'running', elapsedTime: '2.00 seconds' },
    { name: 'Alice', status: 'thinking', elapsedTime: '3.50 seconds' },
    { name: 'Bob', status: 'coding', elapsedTime: '1.25 seconds' },
    { name: 'Charlie', status: 'chatting', elapsedTime: '5.10 seconds' },
    { name: 'Dana', status: 'sleeping', elapsedTime: '10.00 seconds' },
  ];

  return (
    <div className="mylogApp">
      <div className="log">
        {people.map((person, index) => (
          <div key={index} className="log-entry">
            <span className="icon">💻</span>
            {person.name} | {person.status} | {person.elapsedTime}
          </div>
        ))}
        <div className="input-prompt">
          {userId} <span className="blinking-cursor"></span>
        </div>
      </div>
    </div>
  );
}

export default CMDLog;
