import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { JackpotProvider } from './contexts/JackpotContext';
import Header from './components/Header/Header';
import HomeSection from './components/sections/HomeSection/HomeSection';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <JackpotProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomeSection />} />
              </Routes>
            </main>
          </div>
        </JackpotProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;