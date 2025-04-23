import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/auth';
import './Header.css';

const Header: React.FC = () => {
  const { user, login, register, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = '../assets/dark-marble.jpg';
    img.onload = () => console.log('Marble texture loaded successfully');
    img.onerror = () => console.error('Failed to load marble texture');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.auth-icon')
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    // Check if user is logged in on component mount
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsUserLoggedIn(loggedIn);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = '/images/logo.png'; // Updated path
    img.onload = () => {
      console.log('Logo loaded successfully');
      setLogoLoaded(true);
    };
    img.onerror = (error) => {
      console.error('Failed to load logo:', error);
      setLogoError(true);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const headerOffset = 100; // Increased offset to show section headlines
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleAuthIconClick = () => {
    if (isUserLoggedIn) {
      // If logged in, scroll to profile section
      scrollToSection('profile');
    } else {
      // If not logged in, show dropdown
      toggleDropdown();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(adminUsername, 'test@example.com', adminPassword);
      setShowDropdown(false);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(adminUsername, adminPassword);
      setShowDropdown(false);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      const result = await auth.socialLogin(provider as SocialProvider);
      if (result.success) {
        setIsUserLoggedIn(true);
        setShowDropdown(false);
        // Optional: Trigger profile update
        window.location.reload();
      }
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="logo-container">
          <div className="logo" onClick={() => scrollToSection('home')}>
            {!logoError ? (
              <img 
                src="/images/logo.png" // Updated path
                alt="AdPot Logo" 
                style={{ 
                  opacity: logoLoaded ? 1 : 0,
                  height: '48px',
                  width: 'auto',
                  display: 'block'
                }}
                onLoad={() => {
                  console.log('Logo loaded successfully');
                  setLogoLoaded(true);
                }}
                onError={(e) => {
                  console.error('Failed to load logo:', e);
                  setLogoError(true);
                }}
              />
            ) : (
              <span className="logo-fallback">AP</span>
            )}
            <h1>AdPot</h1>
          </div>
          <span className="slogan">Rags to riches</span>
        </div>
        <nav className="nav-links">
          <a onClick={() => scrollToSection('home')}>Watch</a>
          <a onClick={() => scrollToSection('pools')}>Pools</a>
          <a onClick={() => scrollToSection('rewards')}>Rewards</a>
          <a onClick={() => scrollToSection('profile')}>Profile</a>
          <a onClick={() => scrollToSection('imprint')}>Imprint</a>
        </nav>
        <div className="auth-container">
          <button 
            className="auth-icon" 
            onClick={handleAuthIconClick}
            title={isUserLoggedIn ? "Go to Profile" : "Login/Register"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          {/* Only show dropdown if not logged in */}
          {!isUserLoggedIn && showDropdown && (
            <div className="auth-dropdown" ref={dropdownRef}>
              <form className="auth-form" onSubmit={handleLogin}>
                {isLogin ? (
                  <>
                    <input 
                      type="text" 
                      placeholder="Username" 
                      className="auth-input"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="auth-input"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                    <div className="remember-me">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                      />
                      <label htmlFor="remember">Remember me</label>
                    </div>
                    <button type="submit" className="auth-submit">Login</button>
                  </>
                ) : (
                  <>
                    <div className="auth-social-container">
                      <div className="auth-social-row">
                        <button type="button" className="auth-social-button" title="Google">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                          </svg>
                        </button>
                        <button type="button" className="auth-social-button" title="Facebook">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"/>
                          </svg>
                        </button>
                        <button type="button" className="auth-social-button" title="Apple">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05,11.97C17.05,10.59,17.67,9.29,18.77,8.44C17.83,7.09,16.33,6.29,14.74,6.27C13.07,6.1,11.47,7.3,10.62,7.3C9.77,7.3,8.44,6.29,7.02,6.32C5.13,6.38,3.42,7.41,2.58,9.04C0.82,12.34,2.12,17.24,3.81,19.92C4.65,21.23,5.64,22.7,6.99,22.65C8.31,22.6,8.82,21.84,10.39,21.84C11.96,21.84,12.42,22.65,13.81,22.62C15.24,22.6,16.1,21.29,16.92,19.97C17.57,18.96,18.05,17.85,18.35,16.68C17.03,16.04,16.2,14.78,16.2,13.42"/>
                          </svg>
                        </button>
                      </div>
                      <div className="auth-social-row">
                        <button type="button" className="auth-social-button" title="Instagram">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                          </svg>
                        </button>
                        <button type="button" className="auth-social-button" title="TikTok">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        </button>
                        <button type="button" className="auth-social-button" title="X (Twitter)">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="auth-submit" onClick={handleRegister}>Register</button>
                  </>
                )}
                <div className="auth-toggle" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'New? Register here' : 'Already have an account?'}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;