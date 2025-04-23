<?php get_header(); ?>

    <div class="user-corner">
        <div class="user-icon">👤</div>
        <!-- Profile Menu (Shown when logged in) -->
        <div class="profile-menu">
            <div class="user-info">
                <span class="user-name">Test User</span>
                <span class="user-balance">$0.00</span>
            </div>
            <button class="profile-btn cashout-btn">Cash Out</button>
            <button class="profile-btn settings-btn">Settings</button>
            <button class="profile-btn logout-btn">Logout</button>
        </div>
        <!-- Login Panel (Shown when logged out) -->
        <div class="login-panel">
            <div class="auth-toggle">
                <button class="toggle-btn active" data-form="login">Login</button>
                <button class="toggle-btn" data-form="register">Register</button>
            </div>
            
            <form class="login-form active">
                <input type="text" placeholder="Username" class="login-input">
                <input type="password" placeholder="Password" class="login-input">
                <button type="submit" class="login-button">Login</button>
            </form>

            <form class="register-form">
                <input type="text" placeholder="Username" class="login-input" required>
                <input type="email" placeholder="Email" class="login-input" required>
                <input type="password" placeholder="Password" class="login-input" required>
                <input type="password" placeholder="Confirm Password" class="login-input" required>
                <input type="text" placeholder="Display Name" class="login-input" required>
                <button type="submit" class="login-button">Register</button>
            </form>

            <div class="social-login">
                <h3>Or Login With:</h3>
                <div class="social-buttons">
                    <button class="social-btn facebook" onclick="window.location.href='/auth/facebook'">
                        <img src="assets/icons/facebook.png" alt="Facebook">
                    </button>
                    <button class="social-btn youtube" onclick="window.location.href='/auth/youtube'">
                        <img src="assets/icons/youtube.png" alt="YouTube">
                    </button>
                    <button class="social-btn twitter" onclick="window.location.href='/auth/x'">
                        <img src="assets/icons/x.png" alt="X">
                    </button>
                    <button class="social-btn instagram" onclick="window.location.href='/auth/instagram'">
                        <img src="assets/icons/instagram.png" alt="Instagram">
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="money-rain-left"></div>
    <div class="money-rain-right"></div>
    <header class="cyberpunk-header">
        <div class="logo">
            <img src="assets/logo.png" alt="AdPot Logo">
            <div class="title-container">
                <h1 class="title">adpot</h1>
                <span class="slogan">Watch You Rich</span>
            </div>
        </div>
    </header>
    <main class="content">
        <div class="left-section">
            <section class="ad-section">
                <h2>Watch Ads to Increase the Jackpot</h2>
                <div class="ad-container">
                    <iframe 
                        id="google-ad" 
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&enablejsapi=1" 
                        frameborder="0" 
                        allow="autoplay; encrypted-media" 
                        allowfullscreen>
                    </iframe>
                    <div class="total-contributions">
                        Total Contributions: <span id="total-contributions">0</span>
                    </div>
                </div>
            </section>
        </div>
        <div class="right-section">
            <div class="pot" id="yearly-pot">
                <h3>Yearly Jackpot</h3>
                <p class="amount">$0.00</p>
                <p class="timer">Next Payout: <span id="yearly-timer">365d 00:00:00</span></p>
                <p class="pot-chances" title="Shows your contributions out of total views. More views = higher chance of winning">Your Chances: <span id="yearly-user-contributions">0</span>:<span id="yearly-total-contributions">0</span></p>
                <p class="last-winner">Last Winners:</p>
                <ul id="yearly-last-winners"></ul>
            </div>
            <div class="pot" id="random-pot">
                <h3>Random Jackpot</h3>
                <p class="amount">$0.00</p>
                <p class="random-chances" title="Shows your chance of winning (1 if registered, 0 if not) out of total active users">Your Chances: <span id="random-user-chances">0:0</span></p>
                <p class="last-winner">Last Winners:</p>
                <ul id="random-last-winners"></ul>
            </div>
            <div class="pot" id="hourly-pot">
                <h3>Hourly Jackpot</h3>
                <p class="amount">$0.00</p>
                <p class="timer">Next Payout: <span id="hourly-timer">00:00:00</span></p>
                <p class="pot-chances" title="Shows your contributions out of total views. More views = higher chance of winning">Your Chances: <span id="hourly-user-contributions">0</span>:<span id="hourly-total-contributions">0</span></p>
                <p class="last-winner">Last Winners:</p>
                <ul id="hourly-last-winners"></ul>
            </div>
            <div class="test-buttons">
                <button id="test-ad-button" class="test-ad-button">Simulate Watched Video</button>
                <button id="reset-hourly" class="test-ad-button">Countdown Hourly Jackpot</button>
                <button id="reset-yearly" class="test-ad-button">Countdown Yearly Jackpot</button>
                <button id="test-login" class="test-ad-button">Toggle Logged In State</button>
            </div>
        </div>
    </main>
    <footer class="site-footer">
        <button class="imprint-toggle">Imprint</button>
        <div class="imprint-content">
            <h3>Legal Information</h3>
            <p>Company: AdPot Inc.</p>
            <p>Address: 123 Crypto Street, Web3 City</p>
            <p>Email: contact@adpot.com</p>
            <p>Registration: #12345678</p>
            <p>VAT ID: EU123456789</p>
        </div>
    </footer>
    <div class="slot-overlay">
        <div class="slot-container">
            <div class="slot-text"></div>
            <div class="winner-text"></div>
        </div>
    </div>
    <div class="cashout-panel">
        <div class="cashout-header">
            <h2>Cash Out Balance</h2>
            <button class="close-cashout">&times;</button>
        </div>
        <div class="payment-methods">
            <div class="payment-method" data-method="paypal">
                <img src="assets/icons/paypal.png" class="payment-method-icon" alt="PayPal">
                PayPal (min $10.00)
            </div>
            <div class="payment-method" data-method="bankTransfer">
                <img src="assets/icons/bank.png" class="payment-method-icon" alt="Bank Transfer">
                Bank Transfer (min $20.00)
            </div>
        </div>
        <div class="payment-details">
            <!-- PayPal Details -->
            <div class="paypal-details payment-form">
                <input type="email" class="payment-input" placeholder="PayPal Email" required>
            </div>
            <!-- Bank Transfer Details -->
            <div class="bank-details payment-form">
                <input type="text" class="payment-input" placeholder="Account Holder Name" required>
                <input type="text" class="payment-input" placeholder="IBAN" required>
                <input type="text" class="payment-input" placeholder="BIC/SWIFT" required>
                <input type="text" class="payment-input" placeholder="Bank Name" required>
            </div>
        </div>
        <input type="number" class="cashout-amount" placeholder="Enter amount" min="10" step="0.01">
        <div class="fee-breakdown"></div>
        <button class="cashout-button" disabled>Cash Out</button>
    </div>
    <div class="login-notification">Log in to join lottery. It's 100% free!</div>
    <script src="scripts/userDataManager.js"></script>
    <script src="scripts/paymentProcessor.js"></script>
    <script src="scripts/pot-timers.js"></script>

<?php get_footer(); ?>