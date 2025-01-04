import './App.css';
import CMDLoginPopup from './Component/Login/CMDLoginPopup';
import CMDLog from './Component/LogWindow/CMDLog';
import { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');

  const handleLogin = (username) => {
    setUserId(username);
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {!isLoggedIn ? <CMDLoginPopup onLogin={handleLogin} /> : <CMDLog userId={userId} />}
    </div>
  );
}

export default App;
