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
  const headerRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (headerRef.current) {
      console.log('Header HTML:', headerRef.current.outerHTML);
      console.log('Header styles:', window.getComputedStyle(headerRef.current));
    }
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'watch') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
    <header className="header">
      {/* Left side */}
      <div className="left-section">
        <div className="logo">
          <img 
            src="/images/logo.png"
            alt="AdPot Logo" 
            style={{ 
              display: 'block',
              width: '40px',
              height: '40px',
              objectFit: 'contain'
            }} 
          />
          <h1>ADPOT</h1>
        </div>
      </div>
      {/* Right side */}
      <div className="right-section">
        <nav className="nav-links">
          <a onClick={() => scrollToSection('watch')}>Watch</a>
          <a onClick={() => scrollToSection('pools')}>Pools</a>
          <a onClick={() => scrollToSection('rewards')}>Rewards</a>
          <a onClick={() => scrollToSection('profile')}>Profile</a>
          <a onClick={() => scrollToSection('imprint')}>Imprint</a>
        </nav>
        <div className="auth-container">
          <button className="auth-icon" title="Login/Register">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;