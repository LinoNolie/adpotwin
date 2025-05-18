import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { JackpotProvider } from './contexts/JackpotContext';
import Header from './components/Header';
import Home from './pages/Home';
import Pools from './pages/Pools';
import Rewards from './pages/Rewards';
import About from './pages/About';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './styles/index.css';
import './styles/global.css';
import './styles/Navbar.css';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href')?.substring(1);
        const target = targetId ? document.getElementById(targetId) : null;
        
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <JackpotProvider>
          <Router>
            <div className="app">
              <Header onWatchClick={scrollToTop} />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/pools" element={<Pools />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/profile" element={<Home />} />
                  <Route path="/imprint" element={<Home />} />
                  <Route path="*" element={<Home />} />
                </Routes>
                <div>
                  <section id="home">
                    {/* Home section content */}
                  </section>
                  <section id="about">
                    {/* About section content */}
                  </section>
                  <section id="features">
                    {/* Features section content */}
                  </section>
                  <section id="contact">
                    {/* Contact section content */}
                  </section>
                </div>
              </main>
            </div>
          </Router>
        </JackpotProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;