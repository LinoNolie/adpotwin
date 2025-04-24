class UserDataManager {
    constructor() {
        this.users = new Map();
        this.onlineUsers = new Set();
        // Initialize test user
        this.testUser = {
            id: 'test-user-1',
            username: 'Test User',
            balance: 100.00,
            contributions: {
                hourly: 0,
                yearly: 0
            },
            isRegistered: true
        };
        this.users.set(this.testUser.id, this.testUser);
    }

    // Creates new user with initial settings
    createUser(userData) {
        const user = {
            id: crypto.randomUUID(),
            nickname: userData.nickname,
            email: userData.email,
            balance: 0,
            adPreferences: {
                clientId: null, // Google AdSense client ID
                personalization: true
            },
            paymentMethods: [],
            contributionHistory: {
                hourly: 0,
                yearly: 0,
                random: 0
            },
            contributions: {
                hourly: 0,
                yearly: 0,
                total: 0
            },
            createdAt: new Date(),
            lastLogin: new Date()
        };
        this.users.set(user.id, user);
        return user.id;
    }

    // Updates user balance
    updateBalance(userId, amount) {
        const user = this.users.get(userId);
        if (user) {
            user.balance += amount;
            return true;
        }
        return false;
    }

    // Adds payment method to user account
    addPaymentMethod(userId, method) {
        const user = this.users.get(userId);
        if (user) {
            user.paymentMethods.push({
                type: method.type,
                lastFour: method.lastFour,
                isVerified: method.isVerified
            });
            return true;
        }
        return false;
    }

    // Retrieves user's AdSense-related data
    getAdSenseData(userId) {
        const user = this.users.get(userId);
        if (user) {
            return {
                clientId: user.adPreferences.clientId,
                personalization: user.adPreferences.personalization
            };
        }
        return null;
    }

    async registerUser(userData) {
        const { username, email, password, displayName } = userData;
        
        // Validate input
        if (!username || !email || !password || !displayName) {
            throw new Error('All fields are required');
        }
        
        // Check if username exists
        if (this.users.has(username)) {
            throw new Error('Username already taken');
        }

        const user = {
            id: crypto.randomUUID(),
            username,
            email,
            displayName,
            password: await this.hashPassword(password), // In real app, use proper password hashing
            balance: 0,
            createdAt: new Date(),
            lastLogin: new Date()
        };

        this.users.set(username, user);
        return user.id;
    }

    async hashPassword(password) {
        // In real app, use proper password hashing
        return btoa(password);
    }

    updateContributions(userId, type) {
        const user = this.users.get(userId);
        if (user && user.contributions) {
            user.contributions[type]++;
            return user.contributions[type];
        }
        return 0;
    }

    resetContributions(type) {
        this.users.forEach(user => {
            user.contributions[type] = 0;
        });
    }

    getUserContributions(userId) {
        const user = this.users.get(userId);
        return user ? user.contributions : { hourly: 0, yearly: 0, total: 0 };
    }

    getTestUser() {
        const testUser = {
            id: 'test-user-1',
            username: 'Test User',
            balance: 100.00,
            isRegistered: true
        };
        this.users.set(testUser.id, testUser);
        return testUser;
    }

    setUserOnline(userId) {
        this.onlineUsers.add(userId);
        this.updateRandomPotDisplay();
    }

    setUserOffline(userId) {
        this.onlineUsers.delete(userId);
        this.updateRandomPotDisplay();
    }

    getOnlineUsersCount() {
        // Just return 1 when someone is logged in, 1 when logged out (representing other users)
        return this.onlineUsers.size || 1;
    }

    updateRandomPotDisplay() {
        const onlineCount = this.getOnlineUsersCount();
        const userChances = currentUser.isRegistered ? `1:${onlineCount}` : `0:${onlineCount}`;
        document.getElementById('random-user-chances').textContent = userChances;
    }
}

// Add form handling
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const form = btn.dataset.form;
            loginForm.classList.toggle('active', form === 'login');
            registerForm.classList.toggle('active', form === 'register');
        });
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        
        try {
            const userData = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                displayName: formData.get('displayName')
            };

            const userId = await userManager.registerUser(userData);
            if (userId) {
                currentUser.isRegistered = true;
                alert('Registration successful! You can now log in.');
                toggleBtns[0].click(); // Switch to login form
            }
        } catch (error) {
            alert(error.message);
        }
    });

    const userIcon = document.querySelector('.user-icon');
    const loginPanel = document.querySelector('.login-panel');
    const profileMenu = document.querySelector('.profile-menu');
    const logoutBtn = document.querySelector('.logout-btn');
    const cashoutBtn = document.querySelector('.cashout-btn');
    
    // Simulate logged in state for testing
    function toggleLoggedIn(isLoggedIn) {
        if (isLoggedIn) {
            const testUser = userManager.getTestUser();
            currentUser = testUser;
            loginPanel.style.display = 'none';
            profileMenu.classList.add('active');
            document.querySelector('.user-name').textContent = testUser.username;
            document.querySelector('.user-balance').textContent = `$${testUser.balance.toFixed(2)}`;
        } else {
            currentUser = { isRegistered: false };
            profileMenu.classList.remove('active');
            loginPanel.style.display = 'block';
        }
        updateRandomChances();
    }

    userIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentUser.isRegistered) {
            profileMenu.classList.toggle('active');
            loginPanel.classList.remove('active');
        } else {
            loginPanel.classList.toggle('active');
            profileMenu.classList.remove('active');
        }
    });

    document.addEventListener('click', (e) => {
        if (!profileMenu.contains(e.target) && !userIcon.contains(e.target)) {
            profileMenu.classList.remove('active');
        }
        if (!loginPanel.contains(e.target) && !userIcon.contains(e.target)) {
            loginPanel.classList.remove('active');
        }
    });

    logoutBtn.addEventListener('click', () => {
        toggleLoggedIn(false);
        loginPanel.style.display = 'block';
    });

    cashoutBtn.addEventListener('click', () => {
        const cashoutPanel = document.querySelector('.cashout-panel');
        cashoutPanel.classList.add('active');
        profileMenu.classList.remove('active');
    });

    // For testing: Simulate login on form submit
    document.querySelector('.login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        toggleLoggedIn(true);
    });
    
    // Add test login button handler
    const testLoginBtn = document.getElementById('test-login');
    testLoginBtn.addEventListener('click', () => {
        const isCurrentlyLoggedIn = currentUser.isRegistered;
        toggleLoggedIn(!isCurrentlyLoggedIn);
        if (!isCurrentlyLoggedIn) {
            const testUser = userManager.getTestUser();
            document.querySelector('.user-name').textContent = testUser.username;
            document.querySelector('.user-balance').textContent = `$${testUser.balance.toFixed(2)}`;
        }
    });

    // Toggle on icon click
    userIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentUser.isRegistered) {
            profileMenu.classList.toggle('active');
            loginPanel.classList.remove('active');
        } else {
            loginPanel.classList.toggle('active');
            profileMenu.classList.remove('active');
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!userIcon.contains(e.target) && 
            !loginPanel.contains(e.target) && 
            !profileMenu.contains(e.target)) {
            loginPanel.classList.remove('active');
            profileMenu.classList.remove('active');
        }
    });

    // Prevent closing when clicking inside menus
    [loginPanel, profileMenu].forEach(menu => {
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
});