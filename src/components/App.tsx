import React from 'react'

function App() {
  return (
    <div>
      <header>
        <div className="logo">
          <img src="/logo192.png" alt="AdPot" />
          <span>ADPOT</span>
        </div>
        <div className="nav-container">
          <nav>
            <a href="#home">Home</a>
            <a href="#about">About</a>
          </nav>
          <div className="user-corner">
            <i className="fas fa-user"></i>
          </div>
        </div>
      </header>
      <h1>AdPot Win</h1>
    </div>
  )
}

export default App
