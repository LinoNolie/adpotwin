import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AuthIcon } from './AuthIcon';
import './navbar.css';  // Add this import

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (!href) return;
        
        const target = document.querySelector(href);
        if (!target) return;

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
    });

    // Add scroll watcher for home section
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelector('.navbar')?.classList.remove('scrolled');
        } else {
          document.querySelector('.navbar')?.classList.add('scrolled');
        }
      });
    }, { threshold: 0.1 });

    const homeSection = document.querySelector('#home');
    if (homeSection) {
      observer.observe(homeSection);
    }

    return () => {
      if (homeSection) {
        observer.unobserve(homeSection);
      }
    };
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <Link to="/" className="navbar-brand">
          ADPOT.WIN
        </Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/pools">Pools</Link>
          <Link to="/rewards">Rewards</Link>
          <Link to="#imprint" className="imprint-link">Imprint</Link>
          <Link to="/imprint" className="imprint-link">Legal Notice</Link>
        </div>
        <div className="nav-right">
          <LanguageSwitcher />
          <AuthIcon />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
