import React, { useState, useEffect, useRef } from 'react';
import { useJackpot } from '../../../contexts/JackpotContext';
import { JackpotCard } from '../../../components/JackpotCard/JackpotCard';
import { Chat } from '../../../components/Chat/Chat';
import { useCountdown } from '../../../hooks/useCountdown';
import { Line } from 'react-chartjs-2';
import './HomeSection.css';
import { useApi } from '../../../hooks/useApi';
import { api } from '../../../services/api';
import { wsService } from '../../../services/websocket';
import { chatLimiter, adWatchLimiter } from '../../../utils/rateLimit';
import { chatRateLimiter } from '../../../utils/rateLimitManager';
import ConnectionStatus from '../../ConnectionStatus/ConnectionStatus';
import { offlineSync } from '../../../utils/offlineSync';
import { useAuth } from '@/contexts/AuthContext';

// Register ChartJS components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface JackpotWin {
  username: string;
  amount: number;
  timestamp: Date;
  potType: 'hourly' | 'yearly' | 'random';
}

const HomeSection: React.FC = () => {
  const { jackpots, dispatch } = useJackpot();
  const { user } = useAuth();
  const poolLabels: Record<string, string> = {
    hourly: 'Hourly Pool',
    yearly: 'Yearly Pool',
    random: 'Random Pool'
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Changed from let to useState
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedPool, setSelectedPool] = useState('all');
  const [activeTab, setActiveTab] = useState('recent');
  const [isAdmin, setIsAdmin] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState<{
    username: string;
    amount: number;
    potType: string;
  } | null>(null);
  const [isSimulatingUser, setIsSimulatingUser] = useState(false);
  const [userStats, setUserStats] = useState({
    totalWatched: 0,
    totalWinnings: 0,
    entries: {
      hourly: 0,
      yearly: 0,
      random: 0
    }
  });
  const [showAdminPanel, setShowAdminPanel] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{
    text: string;
    user?: string;
    type?: 'system' | 'user' | 'winner';
  }>>([]);
  const [chatInput, setChatInput] = useState('');

  // Add new refs and state for chat scroll handling
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  // Add chat scroll handler
  const handleChatScroll = () => {
    const chatDiv = chatMessagesRef.current;
    if (!chatDiv) return;
    
    const isScrolledToBottom = chatDiv.scrollHeight - chatDiv.scrollTop <= chatDiv.clientHeight + 100;
    setIsUserScrolling(!isScrolledToBottom);
  };

  // Add effect to scroll to bottom for new messages
  useEffect(() => {
    const chatDiv = chatMessagesRef.current;
    if (chatDiv && !isUserScrolling) {
      chatDiv.scrollTop = chatDiv.scrollHeight;
    }
  }, [chatMessages, winnerMessage]); // Scroll on new messages or winner announcements

  // Check for admin status on component mount
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  // Add logout function
  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
    window.location.reload();
  };

  const adminCredentials = {
    username: 'admin',
    password: 'adpot2024'
  };

  const handleAdminLogin = (username: string, password: string) => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      setIsAdmin(true);
      alert('Admin login successful!');
    }
  };

  const simulateAdWatch = () => {
    // Simulate an ad being watched
    dispatch({ type: 'INCREMENT_JACKPOT', payload: 0.25 });
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const [jackpotHistory, setJackpotHistory] = useState<JackpotWin[]>([]);
  const [allTimeHighest, setAllTimeHighest] = useState<JackpotWin[]>([]);

  // Add new function to track wins
  const trackJackpotWin = (win: JackpotWin) => {
    // Add to history
    setJackpotHistory(prev => [win, ...prev].slice(0, 50)); // Keep last 50 wins

    // Update all-time highest if applicable
    setAllTimeHighest(prev => {
      const combined = [...prev, win];
      // Sort by amount descending and keep top 10
      return combined
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);
    });
  };

  // Update simulateWin function
  const simulateWin = (type: 'hourly' | 'yearly' | 'random') => {
    const amount = jackpots[type].amount;
    
    // Only track and announce wins if amount is greater than 0
    if (amount > 0) {
      const win = {
        username: 'User' + Math.floor(Math.random() * 1000),
        amount: amount,
        timestamp: new Date(),
        potType: type
      };
      
      setWinnerMessage({
        username: win.username,
        amount: win.amount,
        potType: type
      });

      // Track the win in history
      trackJackpotWin(win);

      // Add chat message for non-zero wins
      setChatMessages(prev => [
        ...prev,
        {
          text: `🎉 Jackpot paid out! The ${type} pot has been won!`,
          type: 'system'
        }
      ]);

      setTimeout(() => {
        setWinnerMessage(null);
      }, 4000);
    }

    // Always reset amount and timer
    dispatch({ type: 'RESET_JACKPOT', payload: type });
  };

  const startAdvertisement = () => {
    if (!adWatchLimiter.canMakeRequest(user?.id || 'anonymous')) {
      const timeUntilReset = adWatchLimiter.getTimeUntilReset(user?.id || 'anonymous');
      alert(`Please wait ${Math.ceil(timeUntilReset / 1000)} seconds before watching another ad`);
      return;
    }

    setIsPlaying(true);
    wsService.send('ad_watch_start', {
      userId: user?.id
    });
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const getTimeLabels = () => {
    const today = new Date();
    
    switch(timeRange) {
      case 'week':
        return Array.from({length: 7}, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          return d.toLocaleDateString('en-US', { weekday: 'short' });
        });
      case 'month':
        return Array.from({length: 4}, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (21 - i * 7));
          return `Week ${i + 1}`;
        });
      case 'year':
        return Array.from({length: 12}, (_, i) => {
          const d = new Date(today);
          d.setMonth(d.getMonth() - (11 - i));
          return d.toLocaleDateString('en-US', { month: 'short' });
        });
      case '3years':
        return Array.from({length: 12}, (_, i) => {
          const d = new Date(today);
          d.setMonth(d.getMonth() - (11 - i) * 3);
          return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
        });
      default:
        return [];
    }
  };

  // Update getChartData to use real history
  const getChartData = () => {
    // Group wins by day for the selected time period
    const periodDays = timeRange === 'week' ? 7 : 
                      timeRange === 'month' ? 30 : 
                      timeRange === 'year' ? 365 : 1095;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    const relevantWins = jackpotHistory.filter(win => win.timestamp > cutoffDate);
    
    const poolData = {
      hourly: [] as number[],
      yearly: [] as number[],
      random: [] as number[]
    };

    // Create data points for each day
    for (let i = 0; i < periodDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (periodDays - 1 - i));
      
      const dayWins = {
        hourly: 0,
        yearly: 0,
        random: 0
      };

      relevantWins.forEach(win => {
        if (win.timestamp.toDateString() === date.toDateString()) {
          dayWins[win.potType] += win.amount;
        }
      });

      poolData.hourly.push(dayWins.hourly);
      poolData.yearly.push(dayWins.yearly);
      poolData.random.push(dayWins.random);
    }

    let datasets = [];
    if (selectedPool === 'all') {
      datasets = [
        {
          label: 'All Pots',
          data: poolData.hourly.map((val, i) => 
            val + poolData.yearly[i] + poolData.random[i]
          ),
          borderColor: 'rgb(227, 213, 202)',
          tension: 0.1
        }
      ];
    } else {
      const poolColors = {
        hourly: 'rgb(227, 213, 202)', // Beige
        yearly: 'rgb(211, 196, 183)', // Darker beige
        random: 'rgb(196, 178, 164)'  // Even darker beige
      };
      
      const poolLabels = {
        hourly: 'Hourly Pot',
        yearly: 'Yearly Pot',
        random: 'Random Pot'
      };
      
      datasets = [{
        label: poolLabels[selectedPool],
        data: poolData[selectedPool],
        borderColor: poolColors[selectedPool],
        tension: 0.1
      }];
    }

    return {
      labels: getTimeLabels(),
      datasets
    };
  };

  const chartData = getChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(227, 213, 202, 0.1)'
        },
        ticks: {
          color: 'rgba(227, 213, 202, 0.8)',
          callback: function(value) {
            return '$ ' + value;
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(227, 213, 202, 0.1)'
        },
        ticks: {
          color: 'rgba(227, 213, 202, 0.8)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(227, 213, 202, 0.8)'
        }
      }
    }
  };

  const faqs = [
    {
      question: "How do jackpots work?",
      answer: "Jackpots are drawn randomly. The hourly pot is drawn every hour, yearly pot once a year, and random pot can trigger at any time."
    },
    {
      question: "How do I increase my chances?",
      answer: "Watch more advertisements to increase your pool entries. Each watch gives you one entry to each active pool."
    },
    {
      question: "When do I receive my winnings?",
      answer: "Winnings are automatically transferred to your linked wallet within 24 hours of winning."
    },
    {
      question: "How do referrals work?",
      answer: "Share your referral link to earn 5% of the ad revenue generated from users who join through your link."
    },
    {
      question: "Can I participate in multiple pools?",
      answer: "Yes! Each advertisement watch gives you entries to all active pools simultaneously."
    }
  ];

  const formatTimer = (timeString: string) => {
    if (!timeString) return '00:00:00';
    
    try {
      if (timeString.includes('d')) {
        const [days, time] = timeString.split('d ');
        if (!time) return '000d 00:00:00';
        const [hours, minutes, seconds] = time.split(':').map(str => str || '00');
        return `${(days || '0').padStart(3, '0')}d ${(hours || '00').padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}:${(seconds || '00').padStart(2, '0')}`;
      }
      
      const [hours, minutes, seconds] = timeString.split(':').map(str => str || '00');
      return `${(hours || '00').padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}:${(seconds || '00').padStart(2, '0')}`;
    } catch (error) {
      console.error('Timer format error:', error);
      return '00:00:00';
    }
  };

  const simulateUser = () => {
    setIsSimulatingUser(!isSimulatingUser);
    if (!isSimulatingUser) {
      setIsLoggedIn(true); // Using setState instead of direct assignment
      setUserStats({
        totalWatched: 156,
        totalWinnings: 234.50,
        entries: {
          hourly: 23,
          yearly: 145,
          random: 89
        }
      });
    } else {
      setIsLoggedIn(false); // Using setState instead of direct assignment
      setUserStats({
        totalWatched: 0,
        totalWinnings: 0,
        entries: { hourly: 0, yearly: 0, random: 0 }
      });
    }
  };

  // Add chat message handler
  const [chatRateLimit, setChatRateLimit] = useState({
    remaining: 5,
    resetTime: 0
  });

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !chatInput.trim()) return;
  
    const userId = user?.id || 'anonymous';
  
    if (!chatRateLimiter.canSendMessage(userId)) {
      const waitTime = chatRateLimiter.getTimeUntilNextMessage(userId);
      setChatInput(''); // Clear input
      setChatRateLimit({
        remaining: 0,
        resetTime: Date.now() + waitTime
      });
      return;
    }
  
    // Send message through WebSocket
    wsService.send('chat_message', {
      text: chatInput,
      userId: user?.id,
      username: user?.username
    });
  
    setChatInput('');
    setChatRateLimit({
      remaining: chatRateLimiter.getRemainingMessages(userId),
      resetTime: chatRateLimiter.getNextResetTime(userId)
    });
  };

  // Add safety check for jackpots
  const getJackpotTimer = (type: 'hourly' | 'yearly') => {
    return jackpots?.[type]?.timer || (type === 'hourly' ? '59:59' : '365d 00:00:00');
  };

  // Update the render section for timers
  const hourlyTimer = useCountdown(
    getJackpotTimer('hourly'),
    () => {
      if (jackpots?.hourly?.amount > 0) {
        simulateWin('hourly');
      }
      // Update timer after win
      dispatch({ type: 'RESET_JACKPOT', payload: 'hourly' });
    },
    true,
    '59:59' // Changed from '60:00'
  );

  const yearlyTimer = useCountdown(
    getJackpotTimer('yearly'),
    () => {
      if (jackpots?.yearly?.amount > 0) {
        simulateWin('yearly');
      }
      // Update timer after win
      dispatch({ type: 'RESET_JACKPOT', payload: 'yearly' });
    },
    true,
    '365d 00:00:00'
  );

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    swiftCode: ''
  });
  const [paypalEmail, setPaypalEmail] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handlePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    // Validate payout amount
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0 || amount > userStats.totalWinnings) {
      alert('Invalid payout amount');
      return;
    }

    // Process payout based on method
    switch (selectedPaymentMethod) {
      case 'bank':
        if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
          alert('Please fill in all bank details');
          return;
        }
        // Process bank transfer
        console.log('Processing bank transfer:', bankDetails);
        break;

      case 'paypal':
        if (!paypalEmail) {
          alert('Please enter PayPal email');
          return;
        }
        // Process PayPal payment
        console.log('Processing PayPal payment:', paypalEmail);
        break;

      case 'qr':
        if (!showScanner) {
          setShowScanner(true);
          return;
        }
        // Process QR payment after scanning
        console.log('Processing QR payment');
        break;
    }

    // Update user balance
    setUserStats(prev => ({
      ...prev,
      totalWinnings: prev.totalWinnings - amount
    }));

    // Close modal and show success message
    setShowPayoutModal(false);
    alert(`Successfully initiated payout of $${amount}`);
  };

  // Update setShowPayoutModal to prefill amount
  const openPayoutModal = () => {
    setPayoutAmount(userStats.totalWinnings.toFixed(2));
    setShowPayoutModal(true);
  };

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update camera access request function
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setCameraStream(stream);
      setHasCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera. Please make sure you have a camera connected and have granted permission.');
      setHasCamera(false);
    }
  };

  // Clean up camera stream when component unmounts or scanner is closed
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Clean up camera when modal closes
  useEffect(() => {
    if (!showPayoutModal && cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setHasCamera(false);
      setShowScanner(false);
    }
  }, [showPayoutModal, cameraStream]);

  // Add new state for avatar
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  // Add handler for avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update renderJackpotCards function
  const renderJackpotCards = () => (
    <div className="jackpots-container">
      <div className="jackpots-label">Jackpots:</div>
      <div className="jackpots-row">
        <div className="jackpot-card">
          <div className="jackpot-content">
            <div className="pool-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="jackpot-text">
              <div className="amount-wrapper">
                <span className="currency">$</span>
                <span className="amount">{jackpots.hourly.amount.toLocaleString()}</span>
              </div>
              <div className="jackpot-timer">{formatTimer(hourlyTimer)}</div>
            </div>
          </div>
        </div>
        
        <div className="jackpot-card">
          <div className="jackpot-content">
            <div className="pool-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="jackpot-text">
              <div className="amount-wrapper">
                <span className="currency">$</span>
                <span className="amount">{jackpots.yearly.amount.toLocaleString()}</span>
              </div>
              <div className="jackpot-timer">{formatTimer(yearlyTimer)}</div>
            </div>
          </div>
        </div>
        
        <div className="jackpot-card">
          <div className="jackpot-content">
            <div className="pool-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 15v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" />
                <circle cx="12" cy="7" r="3" />
                <path d="M17 11l1 4l1-4" />
                <circle cx="19" cy="8" r="1" />
              </svg>
            </div>
            <div className="jackpot-text">
              <div className="amount-wrapper">
                <span className="currency">$</span>
                <span className="amount">{jackpots.random.amount.toLocaleString()}</span>
              </div>
              <div className="players-online">{jackpots.random.players} players</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const { execute: fetchJackpots, loading: jackpotsLoading } = useApi({
    maxAttempts: 3,
    onError: (error) => {
      console.error('Failed to fetch jackpots:', error);
      // Show error notification
    }
  });

  useEffect(() => {
    const getJackpots = async () => {
      try {
        // First try to get fresh data
        const result = await fetchJackpots(() => api.get('/jackpots'));
        
        if (result) {
          dispatch({ type: 'UPDATE_JACKPOT', payload: result });
          offlineSync.cacheData('jackpots', result);
        }
      } catch (error) {
        // If fetch fails, try to use cached data
        const cached = offlineSync.getCachedData('jackpots');
        if (cached) {
          dispatch({ type: 'UPDATE_JACKPOT', payload: cached });
        }
        console.error('Error fetching jackpots:', error);
      }
    };

    getJackpots();
  }, []);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    wsService.connect();

    // Subscribe to various events
    wsService.subscribe('jackpot_update', handleJackpotUpdate);
    wsService.subscribe('winner_announcement', handleWinnerAnnouncement);
    wsService.subscribe('chat_message', handleChatMessage);

    return () => {
      // Cleanup subscriptions and disconnect
      wsService.disconnect();
    };
  }, []);

  // Add WebSocket event handlers
  const handleJackpotUpdate = (data: any) => {
    dispatch({ type: 'UPDATE_JACKPOT', payload: data });
  };

  const handleWinnerAnnouncement = (data: any) => {
    setWinnerMessage({
      username: data.username,
      amount: data.amount,
      potType: data.potType
    });

    // Add to chat messages
    setChatMessages(prev => [...prev, {
      text: `🎉 ${data.username} won ${data.amount} from the ${data.potType} pot!`,
      type: 'winner'
    }]);
  };

  const handleChatMessage = (data: any) => {
    setChatMessages(prev => [...prev, {
      text: data.text,
      user: data.username,
      type: 'user'
    }]);
  };

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'failed'>('disconnected');
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    wsService.subscribe('connection_status', (status) => {
      setConnectionStatus(status);
    });
    
    // ...existing WebSocket subscriptions...
  }, []);

  // Add effect to monitor pending requests
  useEffect(() => {
    const updatePendingCount = () => {
      const pending = offlineSync.getPendingRequests();
      setPendingRequests(pending.length);
    };

    // Update initially and when online status changes
    updatePendingCount();
    window.addEventListener('online', updatePendingCount);
    window.addEventListener('offline', updatePendingCount);

    // Set up interval to check pending requests
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener('online', updatePendingCount);
      window.removeEventListener('offline', updatePendingCount);
      clearInterval(interval);
    };
  }, []);

  // Add new state for cookie consent
  const [showCookieConsent, setShowCookieConsent] = useState(true);
  
  // Add useEffect to check cookie consent
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      setShowCookieConsent(false);
    }
  }, []);

  // Add cookie consent handlers
  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookieConsent(false);
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookieConsent', 'false');
    setShowCookieConsent(false);
  };

  // Update random timer calculation (1.5 years in milliseconds)
  const getRandomTimer = () => {
    const maxTime = 1.5 * 365 * 24 * 60 * 60 * 1000; // 1.5 years in ms
    return Math.floor(Math.random() * maxTime);
  };

  const handlePotAction = (type: PoolType) => {
    dispatch({ type: 'RESET_JACKPOT', potType: type });
  };

  if (jackpotsLoading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  const renderFaqContent = () => (
    <div className="faq-messages">
      {faqs.map((faq, index) => (
        <div 
          key={index} 
          className="faq-item"
          onClick={() => toggleFaq(index)}
        >
          <h4>
            {faq.question}
            <span>{expandedFaq === index ? '−' : '+'}</span>
          </h4>
          {expandedFaq === index && <p>{faq.answer}</p>}
        </div>
      ))}
    </div>
  );

  // Add login handlers
  const handleSocialLogin = async (provider: string) => {
    try {
      const response = await api.get(`/auth/${provider}`);
      if (response.success) {
        setIsLoggedIn(true);
        // Handle successful login
      }
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    }
  };

  return (
    <div className="home-container">
      <ConnectionStatus 
        status={connectionStatus}
        pendingRequests={pendingRequests}
        isOnline={navigator.onLine}
      />
      {/* Home section */}
      <section id="home" className="section">
        <div className="content-wrapper">
          <div className="video-section">
            <div 
              className="video-container" 
              onClick={startAdvertisement}
              role="button"
              tabIndex={0}
            >
              {isPlaying ? (
                <div className="video-active">
                  <h3>Advertisement Playing...</h3>
                </div>
              ) : (
                <div className="video-placeholder">
                  <h3>Click Here to Watch Advertisement and Contribute Jackpots</h3>
                  <p>Register to Join Lotteries</p>
                  <span className="subtitle">More Watches Mean Higher Chances</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="interactive-section">
            <div className="button-group">
              <button 
                className="watch-button" 
                onClick={startAdvertisement}
                disabled={isPlaying}
              >
                {isPlaying ? 'Watching...' : 'Watch to Win'}
              </button>
              <button 
                className="faq-button" 
                onClick={() => setShowFaq(!showFaq)}
              >
                {showFaq ? 'Chat' : 'FAQ'}
              </button>
            </div>
            {showFaq ? (
              renderFaqContent()
            ) : (
              <Chat
                messages={chatMessages}
                isLoggedIn={isLoggedIn}
                chatInput={chatInput}
                onInputChange={(e) => setChatInput(e.target.value)}
                onSubmit={handleChatSubmit}
                winnerMessage={winnerMessage}
              />
            )}
          </div>
        </div>
        
        {renderJackpotCards()}
      </section>

      {/* Pools section */}
      <section id="pools" className="section">
        <h2>Available Pools</h2>
        <div className="pools-container">
          <div className="pool-card">
            <h3>Hourly Jackpot</h3>
            <div className="pool-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="amount-display">
              <span className="currency">$</span>
              <span className="amount">{jackpots.hourly.amount.toLocaleString()}</span>
            </div>
            <div className="timer">{formatTimer(hourlyTimer)}</div>
            <div className="pool-stats">
              <div className="stat-item">
                <span className="stat-label">Your Entries</span>
                <span className="stat-value">23</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Entries</span>
                <span className="stat-value">1,234</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Your Chances</span>
                <span className="stat-value">1.86%</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-label">Registered Contributors</span>
                <span className="stat-value">156</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Contributors</span>
                <span className="stat-value">891</span>
              </div>
            </div>
          </div>

          {/* Fix the pool card yearly section */}
          <div className="pool-card">
            <h3>Yearly Jackpot</h3>
            <div className="pool-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="amount-display">
              <span className="currency">$</span>
              <span className="amount">{jackpots.yearly.amount.toLocaleString()}</span>
            </div>
            <div className="timer">{formatTimer(yearlyTimer)}</div>
            <div className="pool-stats">
              <div className="stat-item">
                <span className="stat-label">Your Entries</span>
                <span className="stat-value">145</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Entries</span>
                <span className="stat-value">12,445</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Your Chances</span>
                <span className="stat-value">1.16%</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-label">Registered Contributors</span>
                <span className="stat-value">2,341</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Contributors</span>
                <span className="stat-value">5,167</span>
              </div>
            </div>
          </div>

          <div className="pool-card">
            <h3>Random Jackpot</h3>
            <div className="pool-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 15v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" />
                <circle cx="12" cy="7" r="3" />
                <path d="M17 11l1 4l1-4" />
                <circle cx="19" cy="8" r="1" />
              </svg>
            </div>
            <div className="amount-display">
              <span className="currency">$</span>
              <span className="amount">{jackpots.random.amount.toLocaleString()}</span>
            </div>
            <div className="players-count">{jackpots.random.players} players</div>
            <div className="pool-stats">
              <div className="stat-item">
                <span className="stat-label">Payout Timing</span>
                <span className="stat-value">Random</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Your Chances</span>
                <span className="stat-value">1 of 423</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-label">Players Online</span>
                <span className="stat-value">423</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value status-active">Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards section */}
      <section id="rewards" className="section">
        <h2>History of Rewards</h2>
        <div className="rewards-container">
          <div className="chart-controls">
            <div className="filter-buttons">
              <button 
                className={`control-button ${selectedPool === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedPool('all')}
              >
                All Pots
              </button>
              <button 
                className={`control-button ${selectedPool === 'hourly' ? 'active' : ''}`}
                onClick={() => setSelectedPool('hourly')}
              >
                Hourly
              </button>
              <button 
                className={`control-button ${selectedPool === 'yearly' ? 'active' : ''}`}
                onClick={() => setSelectedPool('yearly')}
              >
                Yearly
              </button>
              <button 
                className={`control-button ${selectedPool === 'random' ? 'active' : ''}`}
                onClick={() => setSelectedPool('random')}
              >
                Random
              </button>
              
              <div className="control-divider"></div>
              
              <button 
                className={`control-button ${timeRange === 'week' ? 'active' : ''}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button 
                className={`control-button ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
              <button 
                className={`control-button ${timeRange === 'year' ? 'active' : ''}`}
                onClick={() => setTimeRange('year')}
              >
                Year
              </button>
              <button 
                className={`control-button ${timeRange === '3years' ? 'active' : ''}`}
                onClick={() => setTimeRange('3years')}
              >
                3 Years
              </button>
            </div>
          </div>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="rewards-nav">
            <button 
              className={`rewards-tab ${activeTab === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent')}
            >
              Recent Winners
            </button>
            <button 
              className={`rewards-tab ${activeTab === 'allTime' ? 'active' : ''}`}
              onClick={() => setActiveTab('allTime')}
            >
              All-Time Highest
            </button>
          </div>
          
          <div className="rewards-grid">
            <div className="reward-category hourly">
              <h3>Hourly Jackpot</h3>
              <div className="winners-list">
                {activeTab === 'recent' ? (
                  jackpotHistory
                    .filter(win => win.potType === 'hourly')
                    .slice(0, 3)
                    .map((win, index) => (
                      <div key={index} className="winner-item">
                        <span className="winner-time">{formatTimeAgo(win.timestamp)}</span>
                        <span className="winner-name">{win.username}</span>
                        <span className="winner-amount">${win.amount.toLocaleString()}</span>
                      </div>
                    ))
                ) : (
                  allTimeHighest
                    .filter(win => win.potType === 'hourly')
                    .slice(0, 3)
                    .map((win, index) => (
                      <div key={index} className="winner-item">
                        <span className="winner-time">{win.timestamp.toLocaleDateString()}</span>
                        <span className="winner-name">{win.username}</span>
                        <span className="winner-amount">${win.amount.toLocaleString()}</span>
                      </div>
                    ))
                )}
                {/* Show empty state if no winners */}
                {((activeTab === 'recent' && 
                   !jackpotHistory.some(win => win.potType === 'hourly')) ||
                  (activeTab === 'allTime' && 
                   !allTimeHighest.some(win => win.potType === 'hourly'))) && (
                  <div className="no-winners">
                    <p>No winners yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="reward-category yearly">
              <h3>Yearly Jackpot</h3>
              <div className="winners-list">
                {activeTab === 'recent' ? (
                  jackpotHistory
                    .filter(win => win.potType === 'yearly')
                    .slice(0, 3)
                    .map((win, index) => (
                      <div key={index} className="winner-item">
                        <span className="winner-time">{formatTimeAgo(win.timestamp)}</span>
                        <span className="winner-name">{win.username}</span>
                        <span className="winner-amount">${win.amount.toLocaleString()}</span>
                      </div>
                    ))
                ) : (
                  allTimeHighest
                    .filter(win => win.potType === 'yearly')
                    .slice(0, 3)
                    .map((win, index) => (
                      <div key={index} className="winner-item">
                        <span className="winner-time">{win.timestamp.toLocaleDateString()}</span>
                        <span className="winner-name">{win.username}</span>
                        <span className="winner-amount">${win.amount.toLocaleString()}</span>
                      </div>
                    ))
                )}
                {/* Show empty state if no winners */}
                {((activeTab === 'recent' && 
                   !jackpotHistory.some(win => win.potType === 'yearly')) ||
                  (activeTab === 'allTime' && 
                   !allTimeHighest.some(win => win.potType === 'yearly'))) && (
                  <div className="no-winners">
                    <p>No winners yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="reward-category random">
              <h3>Random Jackpot</h3>
              <div className="winners-list">
                {activeTab === 'recent' ? (
                  jackpotHistory
                    .filter(win => win.potType === 'random')
                    .slice(0, 3)
                    .map((win, index) => (
                      <div key={index} className="winner-item">
                        <span className="winner-time">{formatTimeAgo(win.timestamp)}</span>
                        <span className="winner-name">{win.username}</span>
                        <span className="winner-amount">${win.amount.toLocaleString()}</span>
                      </div>
                    ))
                ) : (
                  allTimeHighest
                    .filter(win => win.potType === 'random')
                    .slice(0, 3)
                    .map((win, index) => (
                      <div key={index} className="winner-item">
                        <span className="winner-time">{win.timestamp.toLocaleDateString()}</span>
                        <span className="winner-name">{win.username}</span>
                        <span className="winner-amount">${win.amount.toLocaleString()}</span>
                      </div>
                    ))
                )}
                {/* Show empty state if no winners */}
                {((activeTab === 'recent' && 
                   !jackpotHistory.some(win => win.potType === 'random')) ||
                  (activeTab === 'allTime' && 
                   !allTimeHighest.some(win => win.potType === 'random'))) && (
                  <div className="no-winners">
                    <p>No winners yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile section */}
      <section id="profile" className="section">
        <h2>Profile</h2>
        {!isLoggedIn ? (
          <div className="profile-register">
            <h3>Create Your Account</h3>
            <form className="profile-form">
              <input type="text" placeholder="Username" className="profile-input" />
              <input type="email" placeholder="Email" className="profile-input" />
              <input type="password" placeholder="Password" className="profile-input" />
              <input type="password" placeholder="Confirm Password" className="profile-input" />
              <button type="submit" className="profile-submit">Register</button>
              <div className="profile-social">
                <p>Or register with:</p>
                <div className="profile-social-buttons">
                  <button type="button" className="auth-social-button" title="Google" onClick={() => handleSocialLogin('google')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                    </svg>
                  </button>
                  <button type="button" className="auth-social-button" title="Facebook" onClick={() => handleSocialLogin('facebook')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"/>
                    </svg>
                  </button>
                  <button type="button" className="auth-social-button" title="Apple" onClick={() => handleSocialLogin('apple')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05,11.97C17.05,10.59,17.67,9.29,18.77,8.44C17.83,7.09,16.33,6.29,14.74,6.27C13.07,6.1,11.47,7.3,10.62,7.3C9.77,7.3,8.44,6.29,7.02,6.32C5.13,6.38,3.42,7.41,2.58,9.04C0.82,12.34,2.12,17.24,3.81,19.92C4.65,21.23,5.64,22.7,6.99,22.65C8.31,22.6,8.82,21.84,10.39,21.84C11.96,21.84,12.42,22.65,13.81,22.62C15.24,22.6,16.1,21.29,16.92,19.97C17.57,18.96,18.05,17.85,18.35,16.68C17.03,16.04,16.2,14.78,16.2,13.42"/>
                    </svg>
                  </button>
                  <button type="button" className="auth-social-button" title="Instagram" onClick={() => handleSocialLogin('instagram')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                    </svg>
                  </button>
                  <button type="button" className="auth-social-button" title="TikTok" onClick={() => handleSocialLogin('tiktok')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </button>
                  <button type="button" className="auth-social-button" title="X (Twitter)" onClick={() => handleSocialLogin('twitter')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-dashboard">
            <div className="profile-header">
              <div className="profile-info">
                <div className="profile-top">
                  <div className="profile-avatar">
                    {avatarSrc ? (
                      <img 
                        src={avatarSrc} 
                        alt="User Avatar" 
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <div className="profile-name-section">
                    <h3>Username123</h3>
                    <button className="logout-button" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat-box">
                <span className="stat-label">Total Ads Watched</span>
                <span className="stat-value">1,234</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Pots Won</span>
                <span className="stat-value">3</span>
              </div>
              <div className="stat-box balance-box">
                <div className="balance-content">
                  <div>
                    <span className="stat-label">Balance</span>
                    <span className="stat-value">${userStats.totalWinnings.toFixed(2)}</span>
                  </div>
                  <button 
                    className="payout-button"
                    onClick={openPayoutModal}
                    disabled={userStats.totalWinnings <= 0}
                  >
                    Payout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Imprint section */}
      <section id="imprint" className="section">
        <h2>Imprint</h2>
        <div className="imprint-content">
          <div className="imprint-left">
            <p>Legal information</p>
            <p>Terms and conditions</p>
            <p>Privacy policy</p>
            <p className="copyright">© 2025 ADPOT</p>
          </div>
          <div className="imprint-right">
            <p>Lino Froehlich</p>
            <p>295 Thanon Asok - Din Daeng</p>
            <p>Makkasan, Ratchathewi</p>
            <p>Bangkok 10310, Thailand</p>
          </div>
        </div>
      </section>

      {/* Add admin panel */}
      {isAdmin && showAdminPanel && (
        <div className="admin-panel">
          <div className="admin-header">
            <h3>Admin Controls</h3>
            <button 
              className="hide-panel-button"
              onClick={() => setShowAdminPanel(false)}
              title="Hide Admin Panel"
            >
              ×
            </button>
          </div>
          <div className="admin-controls">
            <div className="control-group">
              <h4>User Simulation</h4>
              <button 
                className={`user-simulation ${isSimulatingUser ? 'active' : ''}`}
                onClick={simulateUser}
              >
                {isSimulatingUser ? 'Stop Simulating User' : 'Simulate as User'}
              </button>
            </div>

            <div className="control-group">
              <h4>Jackpot Controls</h4>
              <button onClick={simulateAdWatch}>Simulate Ad Watch</button>
              <button onClick={() => simulateWin('hourly')}>Trigger Hourly Win</button>
              <button onClick={() => simulateWin('yearly')}>Trigger Yearly Win</button>
              <button onClick={() => simulateWin('random')}>Trigger Random Win</button>
            </div>

            <div className="control-group">
              <h4>Admin Actions</h4>
              <button onClick={handleLogout} className="logout-button">
                Logout Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add admin panel button and user stats with proper fragment wrapper */}
      <>
        {isAdmin && !showAdminPanel && (
          <button 
            className="show-admin-button"
            onClick={() => setShowAdminPanel(true)}
            title="Show Admin Panel"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4V20M4 12H20" />
            </svg>
          </button>
        )}

        {/* Update statistics display when simulating user */}
        {isSimulatingUser && (
          <div className="user-stats">
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-label">Total Ads Watched</span>
                <span className="stat-value">{userStats.totalWatched}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Total Winnings</span>
                <span className="stat-value">${userStats.totalWinnings.toFixed(2)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Hourly Entries</span>
                <span className="stat-value">{userStats.entries.hourly}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Yearly Entries</span>
                <span className="stat-value">{userStats.entries.yearly}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Random Entries</span>
                <span className="stat-value">{userStats.entries.random}</span>
              </div>
            </div>
          </div>
        )}
      </>

      {/* Add Payout Modal */}
      {showPayoutModal && (
        <div className="payout-modal">
          <div className="payout-content">
            <div className="payout-header">
              <h3>Request Payout</h3>
              <button className="close-button" onClick={() => setShowPayoutModal(false)}>×</button>
            </div>
            
            <form onSubmit={handlePayout}>
              <div className="amount-input">
                <label>Amount to withdraw</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  max={userStats.totalWinnings}
                  min={0.01}
                  step={0.01}
                  required
                />
              </div>

              <div className="payment-methods">
                <label>Select payment method:</label>
                <div 
                  className={`payment-method ${selectedPaymentMethod === 'bank' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('bank')}
                >
                  <span>Bank Transfer</span>
                </div>
                <div 
                  className={`payment-method ${selectedPaymentMethod === 'paypal' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('paypal')}
                >
                  <span>PayPal</span>
                </div>
                <div 
                  className={`payment-method ${selectedPaymentMethod === 'qr' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('qr')}
                >
                  <span>QR Payment</span>
                </div>
              </div>

              {selectedPaymentMethod === 'bank' && (
                <div className="payment-details">
                  <input
                    type="text"
                    placeholder="Account Name"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="SWIFT Code (Optional)"
                    value={bankDetails.swiftCode}
                    onChange={(e) => setBankDetails({...bankDetails, swiftCode: e.target.value})}
                  />
                </div>
              )}

              {selectedPaymentMethod === 'paypal' && (
                <div className="payment-details">
                  <input
                    type="email"
                    placeholder="PayPal Email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {selectedPaymentMethod === 'qr' && (
                <div className="payment-details qr-section">
                  {showScanner ? (
                    <div className="qr-scanner">
                      {hasCamera ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                        />
                      ) : (
                        <div className="scanner-placeholder">
                          <p>Camera access required for QR scanning</p>
                          <button 
                            type="button" 
                            className="scan-button"
                            onClick={requestCameraAccess}
                          >
                            Enable Camera
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      className="scan-button"
                      onClick={() => {
                        setShowScanner(true);
                        requestCameraAccess();
                      }}
                    >
                      Open Camera to Scan QR
                    </button>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                className="submit-payout"
                disabled={!selectedPaymentMethod || !payoutAmount}
              >
                Confirm Payout
              </button>
            </form>
          </div>
        </div>
      )}

      {showCookieConsent && (
        <div className="cookie-consent">
          <div className="cookie-text">
            We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          </div>
          <div className="cookie-buttons">
            <button className="cookie-button cookie-accept" onClick={handleAcceptCookies}>
              Accept
            </button>
            <button className="cookie-button cookie-decline" onClick={handleDeclineCookies}>
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

export default HomeSection;
