import React, { useState } from 'react';
import './SettingsPopup.css';

function SettingsPopup({ onChangeBackgroundColor, onChangeTextColor }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const backgroundColors = [
    { name: 'Black', value: '#000' },
    { name: 'Dark Gray', value: '#333' },
    { name: 'Charcoal', value: '#111' },
    { name: 'Solarized Dark', value: '#002b36' },
  ];

  const textColors = [
    { name: 'Lime', value: 'lime' },
    { name: 'Cyan', value: '#00FFFF' },
    { name: 'Magenta', value: '#FF00FF' },
    { name: 'Yellow', value: '#FFFF00' },
  ];

  return (
    <div>
      <button className="hamburger-button" onClick={toggleSettings}>
        ☰
      </button>
      {isSettingsOpen && (
        <div className="settings-popup">
          <h3>Change Background Color</h3>
          {backgroundColors.map((color) => (
            <div
              key={color.value}
              className="color-option"
              onClick={() => {
                onChangeBackgroundColor(color.value);
                setIsSettingsOpen(false);
              }}
            >
              <div
                className="color-sample"
                style={{ backgroundColor: color.value }}
              ></div>
              {color.name}
            </div>
          ))}
          <h3>Change Text Color</h3>
          {textColors.map((color) => (
            <div
              key={color.value}
              className="color-option"
              onClick={() => {
                onChangeTextColor(color.value);
                setIsSettingsOpen(false);
              }}
            >
              <div
                className="color-sample"
                style={{ backgroundColor: color.value }}
              ></div>
              {color.name}
            </div>
          ))}
          <button
            className="cmd-button"
            onClick={toggleSettings}
            style={{ marginTop: '10px' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default SettingsPopup;
