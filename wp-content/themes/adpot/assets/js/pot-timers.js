// Initialize pot amounts and contributions
let hourlyPotAmount = 0;
let yearlyJackpotAmount = 0;
let randomPotAmount = 0;
let hourlyUserContributions = 0;
let yearlyUserContributions = 0;
let hourlyTotalContributions = 0;
let yearlyTotalContributions = 0;
let totalContributions = 0;

// Payment amounts per ad view
const hourlyPayPerAd = 0.002;
const yearlyPayPerAd = 0.004;
const randomPayPerAd = 0.002;

// Replace mock users with proper tracking
let activeUsers = [];
let currentUser = { isRegistered: false };

// Timer variables
let hourlyTimeLeft = 3600; // 1 hour in seconds
let yearlyTimeLeft = 31536000; // 365 days in seconds
let randomTimeLeft = generateRandomTime(); // Random time between 1 hour and 2.5 years

// Core pot management functions
function generateRandomTime() {
    const maxTime = Math.floor(2.5 * 365 * 24 * 60 * 60); // 2.5 years in seconds
    return Math.floor(Math.random() * (maxTime - 3600) + 3600);
}

// Update the random chances display function
function updateRandomChances() {
    const onlineCount = userManager.getOnlineUsersCount();
    const userChances = currentUser.isRegistered ? `1:${onlineCount}` : `0:${onlineCount}`;
    document.getElementById('random-user-chances').textContent = userChances;
}

// Add notification shown flag
let hasShownNotification = false;

function simulateWatchedVideo() {
    // Increase pot amounts
    hourlyPotAmount += hourlyPayPerAd;
    yearlyJackpotAmount += yearlyPayPerAd;
    randomPotAmount += randomPayPerAd;

    // Increment total contributions counter only once
    totalContributions++;
    console.log('Total contributions:', totalContributions); // Debug log

    // Update UI displays
    document.querySelector('#hourly-pot .amount').textContent = `$${hourlyPotAmount.toFixed(2)}`;
    document.querySelector('#yearly-pot .amount').textContent = `$${yearlyJackpotAmount.toFixed(2)}`;
    document.querySelector('#random-pot .amount').textContent = `$${randomPotAmount.toFixed(2)}`;
    document.getElementById('total-contributions').textContent = totalContributions;

    // Update user-specific contributions only if logged in
    if (currentUser.isRegistered) {
        hourlyUserContributions++;
        yearlyUserContributions++;
        hourlyTotalContributions++;
        yearlyTotalContributions++;
        
        // Update contribution displays
        document.getElementById('hourly-user-contributions').textContent = hourlyUserContributions;
        document.getElementById('yearly-user-contributions').textContent = yearlyUserContributions;
        document.getElementById('hourly-total-contributions').textContent = hourlyTotalContributions;
        document.getElementById('yearly-total-contributions').textContent = yearlyTotalContributions;
    }

    // Add highlight effect to all pots
    const pots = document.querySelectorAll('.pot');
    pots.forEach(pot => {
        pot.classList.remove('pot-highlight');
        void pot.offsetWidth; // Force reflow
        pot.classList.add('pot-highlight');
    });

    // Show notification if not logged in and hasn't been shown
    if (!currentUser.isRegistered && !hasShownNotification) {
        const notification = document.querySelector('.login-notification');
        notification.classList.add('show');
        hasShownNotification = true;
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    updateRandomChances();
}

// Remove any duplicate event listeners
const testAdButton = document.getElementById('test-ad-button');
testAdButton.replaceWith(testAdButton.cloneNode(true));
document.getElementById('test-ad-button').addEventListener('click', simulateWatchedVideo);

function updateContributionsDisplay() {
    document.getElementById('hourly-user-contributions').textContent = currentUser.isRegistered ? hourlyUserContributions : 0;
    document.getElementById('yearly-user-contributions').textContent = currentUser.isRegistered ? yearlyUserContributions : 0;
    document.getElementById('hourly-total-contributions').textContent = hourlyTotalContributions;
    document.getElementById('yearly-total-contributions').textContent = yearlyTotalContributions;
}

function pickWinner(potType) {
    // Handles winner selection and prize distribution
    // Different logic for random, hourly, and yearly pots
    if (potType === "random") {
        // For random pot, check if there are active users
        if (activeUsers.length === 0) {
            // No active users, just reset the timer and keep the pot amount
            randomTimeLeft = generateRandomTime();
            return;
        }

        // If there are active users, proceed with winner selection
        const winner = activeUsers[Math.floor(Math.random() * activeUsers.length)];
        winner.balance += randomPotAmount;

        // Add winner to the last winners list
        const lastWinnersList = document.getElementById('random-last-winners');
        const winnerItem = document.createElement('li');
        winnerItem.textContent = `${winner.nickname} - $${randomPotAmount.toFixed(2)}`;
        lastWinnersList.prepend(winnerItem);

        // Limit the last winners list to 3 entries
        while (lastWinnersList.children.length > 3) {
            lastWinnersList.removeChild(lastWinnersList.lastChild);
        }

        // Reset the random pot
        randomPotAmount = 0;
        document.querySelector('#random-pot .amount').textContent = `$${randomPotAmount.toFixed(2)}`;
        randomTimeLeft = generateRandomTime();

        alert(`${winner.nickname} has won the random pot of $${randomPotAmount.toFixed(2)}!`);
        return;
    }

    let winner, potAmount;
    
    if (potType === "hourly") {
        potAmount = hourlyPotAmount;
        winner = {
            nickname: "Test User",
            balance: 0
        };
    } else if (potType === "yearly") {
        potAmount = yearlyJackpotAmount;
        winner = {
            nickname: "Test User",
            balance: 0
        };
    }

    // Show slot machine animation
    showSlotAnimation(potType, winner, potAmount);

    // Add winner to the last winners list
    const lastWinnersList = document.getElementById(`${potType}-last-winners`);
    const winnerItem = document.createElement('li');
    winnerItem.textContent = `${winner.nickname} - $${potAmount.toFixed(2)}`;
    lastWinnersList.prepend(winnerItem);

    // Limit the last winners list to 3 entries
    while (lastWinnersList.children.length > 3) {
        lastWinnersList.removeChild(lastWinnersList.lastChild);
    }

    // Reset the pot and contributions
    if (potType === "hourly") {
        hourlyPotAmount = 0;
        hourlyUserContributions = 0;
        hourlyTotalContributions = 0;
        document.querySelector('#hourly-pot .amount').textContent = `$${hourlyPotAmount.toFixed(2)}`;
        document.getElementById('hourly-user-contributions').textContent = hourlyUserContributions;
        document.getElementById('hourly-total-contributions').textContent = hourlyTotalContributions;
        hourlyTimeLeft = 3600;
    } else if (potType === "yearly") {
        yearlyJackpotAmount = 0;
        yearlyUserContributions = 0;
        yearlyTotalContributions = 0;
        document.querySelector('#yearly-pot .amount').textContent = `$${yearlyJackpotAmount.toFixed(2)}`;
        document.getElementById('yearly-user-contributions').textContent = yearlyUserContributions;
        document.getElementById('yearly-total-contributions').textContent = yearlyTotalContributions;
        yearlyTimeLeft = 31536000;
    }
    
    // Reset contributions after payout
    if (potType === "hourly") {
        userManager.resetContributions('hourly');
        hourlyUserContributions = 0;
        hourlyTotalContributions = 0;
    } else if (potType === "yearly") {
        userManager.resetContributions('yearly');
        yearlyUserContributions = 0;
        yearlyTotalContributions = 0;
    }
    
    updateContributionsDisplay();
}

function showSlotAnimation(potType, winner, amount) {
    // Displays winning animation
    const overlay = document.querySelector('.slot-overlay');
    const slotText = document.querySelector('.slot-text');
    const winnerText = document.querySelector('.winner-text');
    
    overlay.style.display = 'flex';
    slotText.textContent = `${potType.toUpperCase()} POT`;
    
    // Simulate slot machine effect
    setTimeout(() => {
        slotText.style.animation = 'none';
        winnerText.textContent = `${winner.nickname} wins $${amount.toFixed(2)}!`;
        winnerText.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            overlay.style.display = 'none';
            winnerText.classList.remove('show');
            slotText.style.animation = '';
        }, 3000);
    }, 2000);
}

// Countdown timer function
function startCountdowns() {
    // Manages countdown timers for all pots
    setInterval(() => {
        // Update hourly timer
        hourlyTimeLeft--;
        if (hourlyTimeLeft <= 0) {
            pickWinner("hourly");
            hourlyTimeLeft = 3600; // Reset to 1 hour
        }

        // Update yearly timer
        yearlyTimeLeft--;
        if (yearlyTimeLeft <= 0) {
            pickWinner("yearly");
            yearlyTimeLeft = 31536000; // Reset to 365 days
        }

        // Update random timer (hidden from UI)
        randomTimeLeft--;
        if (randomTimeLeft <= 0) {
            pickWinner("random");
        }

        // Update visible timers
        const hours = Math.floor(hourlyTimeLeft / 3600);
        const minutes = Math.floor((hourlyTimeLeft % 3600) / 60);
        const seconds = hourlyTimeLeft % 60;
        document.getElementById('hourly-timer').textContent = `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const days = Math.floor(yearlyTimeLeft / 86400);
        const yearlyHours = Math.floor((yearlyTimeLeft % 86400) / 3600);
        const yearlyMinutes = Math.floor((yearlyTimeLeft % 3600) / 60);
        const yearlySeconds = yearlyTimeLeft % 60;
        document.getElementById('yearly-timer').textContent = `${days}d ${yearlyHours.toString().padStart(2, '0')}:${yearlyMinutes
            .toString()
            .padStart(2, '0')}:${yearlySeconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Add money rain control functions
function createMoneySymbol(side) {
    const symbol = document.createElement('div');
    symbol.className = 'money-symbol';
    symbol.textContent = '$';
    symbol.style.cssText = `
        position: absolute;
        color: #666;
        font-size: ${Math.random() * 10 + 20}px;
        ${side === 'left' ? 'left' : 'right'}: ${Math.random() * 180}px;
        top: -20px;
        animation: moneyRain 2s linear forwards;
    `;
    return symbol;
}

function triggerMoneyRain() {
    const leftContainer = document.querySelector('.money-rain-left');
    const rightContainer = document.querySelector('.money-rain-right');
    
    // Create multiple symbols
    for(let i = 0; i < 15; i++) {
        const leftSymbol = createMoneySymbol('left');
        const rightSymbol = createMoneySymbol('right');
        
        leftContainer.appendChild(leftSymbol);
        rightContainer.appendChild(rightSymbol);
        
        // Remove symbols after animation
        setTimeout(() => {
            leftSymbol.remove();
            rightSymbol.remove();
        }, 2000);
    }
    
    // Schedule next rain
    setTimeout(triggerMoneyRain, Math.random() * 45000 + 5000); // Random delay between 5-50 seconds
}

// Start money rain with initial delay
setTimeout(triggerMoneyRain, Math.random() * 45000 + 5000);

// Initialize managers
const userManager = new UserDataManager();
const paymentProcessor = new PaymentProcessor();

// Add this to UserDataManager class
function getRegisteredUsersCount() {
    return this.users.size;
}

// Wait for DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    const testAdButton = document.getElementById('test-ad-button');
    const resetHourlyButton = document.getElementById('reset-hourly');
    const resetYearlyButton = document.getElementById('reset-yearly');

    if (testAdButton) {
        testAdButton.addEventListener('click', simulateWatchedVideo);
    }

    if (resetHourlyButton) {
        resetHourlyButton.addEventListener('click', () => {
            pickWinner("hourly");
        });
    }

    if (resetYearlyButton) {
        resetYearlyButton.addEventListener('click', () => {
            pickWinner("yearly");
        });
    }

    const userIcon = document.querySelector('.user-icon');
    const loginPanel = document.querySelector('.login-panel');
    
    userIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        loginPanel.classList.toggle('active');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!loginPanel.contains(e.target) && !userIcon.contains(e.target)) {
            loginPanel.classList.remove('active');
        }
    });
    
    // Prevent panel close when clicking inside
    loginPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    updateRandomChances();
    startCountdowns();

    const cashoutPanel = document.querySelector('.cashout-panel');
    const closeButton = document.querySelector('.close-cashout');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const amountInput = document.querySelector('.cashout-amount');
    const feeBreakdown = document.querySelector('.fee-breakdown');
    const cashoutButton = document.querySelector('.cashout-button');
    let selectedMethod = null;

    // Add balance button to user panel
    const userPanel = document.querySelector('.login-panel');
    const balanceButton = document.createElement('button');
    balanceButton.className = 'login-button';
    balanceButton.textContent = 'Cash Out Balance';
    
    balanceButton.addEventListener('click', () => {
        if (!currentUser.isRegistered) {
            alert('Please login to access the cash out feature');
            return;
        }
        cashoutPanel.classList.add('active');
    });

    // Only add cash out button if logged in
    if (currentUser.isRegistered) {
        userPanel.appendChild(balanceButton);
    }

    closeButton.addEventListener('click', () => {
        cashoutPanel.classList.remove('active');
    });

    cashoutButton.addEventListener('click', async () => {
        if (!currentUser.isRegistered) {
            alert('Please login to process your cash out');
            cashoutPanel.classList.remove('active');
            return;
        }

        const amount = parseFloat(amountInput.value);
        if (!amount || !selectedMethod) return;

        try {
            const result = await paymentProcessor.processPayout(currentUser.id, amount, selectedMethod);
            if (result.success) {
                alert(`Successfully processed payout of $${result.amount.toFixed(2)}`);
                cashoutPanel.classList.remove('active');
            }
        } catch (error) {
            alert(error.message);
        }
    });

    // Add login state change handler
    function updateCashoutAccess() {
        if (currentUser.isRegistered) {
            if (!userPanel.contains(balanceButton)) {
                userPanel.appendChild(balanceButton);
            }
        } else {
            if (userPanel.contains(balanceButton)) {
                userPanel.removeChild(balanceButton);
            }
            cashoutPanel.classList.remove('active');
        }
    }

    // Call initially and add to any login state changes
    updateCashoutAccess();

    // Update toggle logged in function
    function toggleLoggedIn(isLoggedIn) {
        if (isLoggedIn) {
            const testUser = userManager.getTestUser();
            currentUser = testUser;
            userManager.setUserOnline(testUser.id);
        } else {
            if (currentUser.id) {
                userManager.setUserOffline(currentUser.id);
            }
            currentUser = { isRegistered: false };
        }
        // ...existing code...
        updateRandomChances();
    }

    // Imprint handling
    const imprintToggle = document.querySelector('.imprint-toggle');
    const imprintContent = document.querySelector('.imprint-content');
    
    imprintToggle.addEventListener('click', () => {
        imprintContent.classList.toggle('expanded');
    });

    // Collapse imprint when video starts
    document.getElementById('test-ad-button').addEventListener('click', () => {
        imprintContent.classList.remove('expanded');
    });

    updateContributionsDisplay();
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialize buttons
    const testAdButton = document.getElementById('test-ad-button');
    const resetHourlyButton = document.getElementById('reset-hourly');
    const resetYearlyButton = document.getElementById('reset-yearly');
    const testLoginButton = document.getElementById('test-login');

    // Test Ad Button - Simulate video watch
    testAdButton.addEventListener('click', () => {
        simulateWatchedVideo();
        console.log('Video simulated'); // Debug log
    });

    // Reset Hourly Button - Force hourly pot payout
    resetHourlyButton.addEventListener('click', () => {
        console.log('Forcing hourly payout'); // Debug log
        pickWinner('hourly');
    });

    // Reset Yearly Button - Force yearly pot payout
    resetYearlyButton.addEventListener('click', () => {
        console.log('Forcing yearly payout'); // Debug log
        pickWinner('yearly');
    });

    // Test Login Button - Toggle login state
    testLoginButton.addEventListener('click', () => {
        const isCurrentlyLoggedIn = currentUser.isRegistered;
        console.log('Toggling login state:', !isCurrentlyLoggedIn); // Debug log
        toggleLoggedIn(!isCurrentlyLoggedIn);
    });

    // Initialize starting state
    updateRandomChances();
    updateContributionsDisplay();
});

// Ensure these functions are properly defined and accessible
function updateContributionsDisplay() {
    document.getElementById('hourly-user-contributions').textContent = currentUser.isRegistered ? hourlyUserContributions : 0;
    document.getElementById('yearly-user-contributions').textContent = currentUser.isRegistered ? yearlyUserContributions : 0;
    document.getElementById('hourly-total-contributions').textContent = hourlyTotalContributions;
    document.getElementById('yearly-total-contributions').textContent = yearlyTotalContributions;
    document.getElementById('total-contributions').textContent = totalContributions;
}

document.addEventListener('DOMContentLoaded', () => {
    // Remove old event listeners and create new one
    const testAdButton = document.getElementById('test-ad-button');
    if (testAdButton) {
        const newButton = testAdButton.cloneNode(true);
        testAdButton.parentNode.replaceChild(newButton, testAdButton);
        newButton.addEventListener('click', simulateWatchedVideo, { once: false });
    }
    // ...existing code...
});

document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

    // Cash out panel handling
    const cashoutBtn = document.querySelector('.cashout-btn');
    const cashoutPanel = document.querySelector('.cashout-panel');
    const closeBtn = document.querySelector('.close-cashout');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const amountInput = document.querySelector('.cashout-amount');
    const cashoutButton = document.querySelector('.cashout-button');
    const feeBreakdown = document.querySelector('.fee-breakdown');
    let selectedMethod = null;

    // Open cash out panel
    cashoutBtn.addEventListener('click', () => {
        cashoutPanel.classList.add('active');
        updateBalance();
    });

    // Close cash out panel
    closeBtn.addEventListener('click', () => {
        cashoutPanel.classList.remove('active');
    });

    // Handle payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
            selectedMethod = method.dataset.method;
            
            // Show relevant payment details form
            document.querySelectorAll('.payment-form').forEach(form => form.classList.remove('active'));
            document.querySelector(`.${selectedMethod}-details`).classList.add('active');
            
            updateFeeBreakdown();
        });
    });

    // Validate payment details before enabling cashout
    function validatePaymentDetails() {
        const activeForm = document.querySelector('.payment-form.active');
        if (!activeForm) return false;
        
        const inputs = activeForm.querySelectorAll('input');
        return Array.from(inputs).every(input => input.value.trim() !== '');
    }

    // Update cashout button state
    function updateCashoutButton() {
        const amount = parseFloat(amountInput.value);
        const validAmount = (selectedMethod === 'paypal' && amount >= 10) || 
                           (selectedMethod === 'bankTransfer' && amount >= 20);
        cashoutButton.disabled = !validAmount || !validatePaymentDetails();
    }

    // Add input listeners to payment fields
    document.querySelectorAll('.payment-input').forEach(input => {
        input.addEventListener('input', updateCashoutButton);
    });

    // Handle amount input
    amountInput.addEventListener('input', updateFeeBreakdown);

    function updateFeeBreakdown() {
        const amount = parseFloat(amountInput.value);
        if (!amount || !selectedMethod) {
            feeBreakdown.textContent = '';
            cashoutButton.disabled = true;
            return;
        }

        const fee = selectedMethod === 'paypal' ? amount * 0.029 + 0.30 : amount * 0.01;
        const netAmount = amount - fee;

        feeBreakdown.textContent = `Fee: $${fee.toFixed(2)} | You will receive: $${netAmount.toFixed(2)}`;
        cashoutButton.disabled = (selectedMethod === 'paypal' && amount < 10) || 
                                (selectedMethod === 'bankTransfer' && amount < 20);
    }

    // Handle cash out
    cashoutButton.addEventListener('click', () => {
        const amount = parseFloat(amountInput.value);
        if (amount > currentUser.balance) {
            alert('Insufficient balance!');
            return;
        }

        currentUser.balance -= amount;
        document.querySelector('.user-balance').textContent = `$${currentUser.balance.toFixed(2)}`;
        
        alert(`Successfully withdrew $${amount.toFixed(2)} via ${selectedMethod}!`);
        cashoutPanel.classList.remove('active');
        amountInput.value = '';
        feeBreakdown.textContent = '';
        paymentMethods.forEach(m => m.classList.remove('selected'));
        selectedMethod = null;
        cashoutButton.disabled = true;
    });
});