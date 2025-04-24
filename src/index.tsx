import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { AuthProvider } from './contexts/AuthContext'
import { JackpotProvider } from './contexts/JackpotContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <JackpotProvider>
        <App />
      </JackpotProvider>
    </AuthProvider>
  </React.StrictMode>
)
