import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/LanguageSwitcher.css';

const languages = [
  { code: 'en', name: 'English', countryCode: 'gb' },
  { code: 'es', name: 'Español', countryCode: 'es' },
  { code: 'de', name: 'Deutsch', countryCode: 'de' },
  { code: 'fr', name: 'Français', countryCode: 'fr' },
  { code: 'ru', name: 'Русский', countryCode: 'ru' },
  { code: 'zh', name: '中文', countryCode: 'cn' },
  { code: 'th', name: 'ไทย', countryCode: 'th' },
  { code: 'hi', name: 'हिंदी', countryCode: 'in' }
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="lang-switcher" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ WebkitTapHighlightColor: 'transparent', outline: 'none', border: 'none' }}
      >
        <img
          src={`https://flagpedia.net/data/flags/w20/${currentLang.countryCode}.png`}
          width="20"
          height="15"
          alt={currentLang.name}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        />
      </button>
      {showDropdown && (
        <div className="lang-dropdown">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${language.code === i18n.language ? 'active' : ''}`}
              onClick={() => {
                i18n.changeLanguage(language.code);
                setShowDropdown(false);
              }}
            >
              <img
                src={`https://flagpedia.net/data/flags/w20/${language.countryCode}.png`}
                width="20"
                height="15"
                alt={language.name}
              />
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './AuthIcon.css';

const AuthIcon = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = () => {
    // Implement login logic
    console.log('Login clicked');
    setIsOpen(false);
  };

  const handleRegister = () => {
    // Implement register logic
    console.log('Register clicked');
    setIsOpen(false);
  };

  return (
    <div className="auth-container">
      <button 
        className="auth-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaUserCircle size={24} />
      </button>
      {isOpen && (
        <div className="auth-dropdown">
          <button onClick={handleLogin} className="auth-option">Login</button>
          <button onClick={handleRegister} className="auth-option">Register</button>
        </div>
      )}
    </div>
  );
};

export default AuthIcon;
