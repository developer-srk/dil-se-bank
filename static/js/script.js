// Enhanced Banking App JavaScript Code with Profile, Analytics & Settings

// Global state
let currentUser = null;
let currentBalance = 0;
let transactions = [];
let userProfile = {};
let appSettings = {
    theme: 'light',
    currency: 'INR',
    notifications: true,
    twoFactorAuth: false,
    dailyLimit: 50000,
    language: 'en'
};
let currentTab = 'dashboard';

// Mock API functions
async function mockFetch(url, options) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const body = options.body ? JSON.parse(options.body) : {};
    
    switch (url) {
        case '/api/login':
            if (body.username === 'test' && body.password === 'test') {
                return {
                    json: async () => ({
                        success: true,
                        balance: 5000,
                        username: body.username,
                        message: 'Login successful'
                    })
                };
            } else {
                return {
                    json: async () => ({
                        success: false,
                        message: 'Invalid credentials'
                    })
                };
            }
            
        case '/api/deposit':
            const newBalanceDeposit = currentBalance + parseFloat(body.amount);
            return {
                json: async () => ({
                    success: true,
                    balance: newBalanceDeposit,
                    message: `Deposited ₹${body.amount} successfully`
                })
            };
            
        case '/api/withdraw':
            if (currentBalance >= parseFloat(body.amount)) {
                const newBalanceWithdraw = currentBalance - parseFloat(body.amount);
                return {
                    json: async () => ({
                        success: true,
                        balance: newBalanceWithdraw,
                        message: `Withdrawn ₹${body.amount} successfully`
                    })
                };
            } else {
                return {
                    json: async () => ({
                        success: false,
                        message: 'Insufficient balance'
                    })
                };
            }

        case '/api/profile/update':
            return {
                json: async () => ({
                    success: true,
                    message: 'Profile updated successfully'
                })
            };
            
        default:
            return {
                json: async () => ({
                    success: false,
                    message: 'API endpoint not found'
                })
            };
    }
}

// Utility functions
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function setGreeting(username) {
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        greetingElement.textContent = `Hello, ${username}!`;
    }
}

function setBalance(amount) {
    currentBalance = parseFloat(amount);
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = `₹ ${currentBalance.toFixed(2)}`;
    }
}

function addTransaction(type, amount, description) {
    const transaction = {
        id: Date.now(),
        type: type,
        amount: parseFloat(amount),
        description: description,
        timestamp: new Date().toLocaleString(),
        category: getTransactionCategory(type, description)
    };
    
    transactions.unshift(transaction);
    updateTransactionHistory();
    saveUserData();
}

function getTransactionCategory(type, description) {
    if (type === 'deposit') return 'Income';
    if (description.toLowerCase().includes('food')) return 'Food';
    if (description.toLowerCase().includes('transport')) return 'Transport';
    if (description.toLowerCase().includes('entertainment')) return 'Entertainment';
    if (description.toLowerCase().includes('shopping')) return 'Shopping';
    return 'Other';
}

function updateTransactionHistory() {
    const historyElement = document.getElementById('transactionHistory');
    if (!historyElement) return;
    
    historyElement.innerHTML = '';
    
    transactions.slice(0, 5).forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        const typeClass = transaction.type === 'deposit' ? 'positive' : 'negative';
        const symbol = transaction.type === 'deposit' ? '+' : '-';
        
        transactionElement.innerHTML = `
            <div>
                <div class="transaction-type">${transaction.description}</div>
                <div class="transaction-time">${transaction.timestamp}</div>
            </div>
            <div class="transaction-amount ${typeClass}">
                ${symbol}₹${transaction.amount.toFixed(2)}
            </div>
        `;
        
        historyElement.appendChild(transactionElement);
    });
}

function showNotification(message, type = 'success') {
    if (!appSettings.notifications) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        z-index: 1001;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function isLoggedIn() {
    return currentUser !== null;
}

function loadUserData() {
    const savedUser = JSON.parse(sessionStorage.getItem('bankingAppData') || '{}');
    
    if (savedUser.loggedIn) {
        currentUser = savedUser.username || 'User';
        currentBalance = parseFloat(savedUser.balance || 0);
        transactions = savedUser.transactions || [];
        userProfile = savedUser.profile || getDefaultProfile();
        appSettings = { ...appSettings, ...savedUser.settings };
        
        setGreeting(currentUser);
        setBalance(currentBalance);
        updateTransactionHistory();
        hideLoginModal();
        showTab('dashboard');
    } else {
        showLoginModal();
    }
}

function getDefaultProfile() {
    return {
        fullName: currentUser || 'User',
        email: 'user@example.com',
        phone: '+91 9876543210',
        address: '123 Main Street, Mumbai',
        dateOfBirth: '1990-01-01',
        accountType: 'Savings',
        memberSince: new Date().toLocaleDateString()
    };
}

function saveUserData() {
    const userData = {
        loggedIn: true,
        username: currentUser,
        balance: currentBalance,
        transactions: transactions,
        profile: userProfile,
        settings: appSettings
    };
    
    sessionStorage.setItem('bankingAppData', JSON.stringify(userData));
}

function clearUserData() {
    sessionStorage.removeItem('bankingAppData');
    currentUser = null;
    currentBalance = 0;
    transactions = [];
    userProfile = {};
    appSettings = {
        theme: 'light',
        currency: 'INR',
        notifications: true,
        twoFactorAuth: false,
        dailyLimit: 50000,
        language: 'en'
    };
}

// Tab Management
function showTab(tabName) {
    currentTab = tabName;
    
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(`${tabName}Tab`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Add active class to selected tab
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Load tab-specific content
    switch (tabName) {
        case 'profile':
            loadProfileData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

// Profile Functions
function loadProfileData() {
    if (!userProfile.fullName) {
        userProfile = getDefaultProfile();
    }
    
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        document.getElementById('fullName').value = userProfile.fullName;
        document.getElementById('email').value = userProfile.email;
        document.getElementById('phone').value = userProfile.phone;
        document.getElementById('address').value = userProfile.address;
        document.getElementById('dateOfBirth').value = userProfile.dateOfBirth;
        document.getElementById('accountType').value = userProfile.accountType;
        
        const memberSinceElement = document.getElementById('memberSince');
        if (memberSinceElement) {
            memberSinceElement.textContent = userProfile.memberSince;
        }
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    userProfile = {
        ...userProfile,
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        accountType: document.getElementById('accountType').value
    };
    
    try {
        const response = await mockFetch('/api/profile/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userProfile)
        });
        
        const result = await response.json();
        
        if (result.success) {
            saveUserData();
            showNotification('Profile updated successfully');
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        showNotification('Profile update failed', 'error');
    }
}

// Analytics Functions
function loadAnalyticsData() {
    updateSpendingChart();
    updateCategoryBreakdown();
    updateMonthlyTrends();
    updateAccountSummary();
}

function updateSpendingChart() {
    const chartContainer = document.getElementById('spendingChart');
    if (!chartContainer) return;
    
    const last7Days = getLast7DaysData();
    const maxAmount = Math.max(...last7Days.map(d => d.amount), 1);
    
    chartContainer.innerHTML = last7Days.map(day => `
        <div class="chart-bar">
            <div class="bar" style="height: ${(day.amount / maxAmount) * 100}%"></div>
            <div class="bar-label">${day.day}</div>
            <div class="bar-amount">₹${day.amount}</div>
        </div>
    `).join('');
}

function getLast7DaysData() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];
        
        const dayTransactions = transactions.filter(t => {
            const tDate = new Date(t.timestamp);
            return tDate.toDateString() === date.toDateString() && t.type === 'withdraw';
        });
        
        const amount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
        data.push({ day: dayName, amount });
    }
    
    return data;
}

function updateCategoryBreakdown() {
    const container = document.getElementById('categoryBreakdown');
    if (!container) return;
    
    const categories = {};
    const withdrawals = transactions.filter(t => t.type === 'withdraw');
    
    withdrawals.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    
    const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
    
    container.innerHTML = Object.entries(categories).map(([category, amount]) => {
        const percentage = total > 0 ? (amount / total * 100).toFixed(1) : 0;
        return `
            <div class="category-item">
                <div class="category-info">
                    <span class="category-name">${category}</span>
                    <span class="category-amount">₹${amount.toFixed(2)}</span>
                </div>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="category-percentage">${percentage}%</span>
            </div>
        `;
    }).join('');
}

function updateMonthlyTrends() {
    const container = document.getElementById('monthlyTrends');
    if (!container) return;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const thisMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.timestamp);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    const income = thisMonthTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const expenses = thisMonthTransactions.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = income - expenses;
    
    container.innerHTML = `
        <div class="trend-item">
            <h4>Monthly Income</h4>
            <p class="trend-amount positive">₹${income.toFixed(2)}</p>
        </div>
        <div class="trend-item">
            <h4>Monthly Expenses</h4>
            <p class="trend-amount negative">₹${expenses.toFixed(2)}</p>
        </div>
        <div class="trend-item">
            <h4>Net Savings</h4>
            <p class="trend-amount ${netSavings >= 0 ? 'positive' : 'negative'}">₹${netSavings.toFixed(2)}</p>
        </div>
    `;
}

function updateAccountSummary() {
    const container = document.getElementById('accountSummary');
    if (!container) return;
    
    const totalTransactions = transactions.length;
    const avgTransaction = transactions.length > 0 ? 
        transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0;
    
    container.innerHTML = `
        <div class="summary-item">
            <h4>Current Balance</h4>
            <p class="summary-value">₹${currentBalance.toFixed(2)}</p>
        </div>
        <div class="summary-item">
            <h4>Total Transactions</h4>
            <p class="summary-value">${totalTransactions}</p>
        </div>
        <div class="summary-item">
            <h4>Average Transaction</h4>
            <p class="summary-value">₹${avgTransaction.toFixed(2)}</p>
        </div>
    `;
}

// Settings Functions
function loadSettingsData() {
    document.getElementById('theme').value = appSettings.theme;
    document.getElementById('currency').value = appSettings.currency;
    document.getElementById('notifications').checked = appSettings.notifications;
    document.getElementById('twoFactorAuth').checked = appSettings.twoFactorAuth;
    document.getElementById('dailyLimit').value = appSettings.dailyLimit;
    document.getElementById('language').value = appSettings.language;
}

function handleSettingsUpdate(e) {
    e.preventDefault();
    
    appSettings = {
        theme: document.getElementById('theme').value,
        currency: document.getElementById('currency').value,
        notifications: document.getElementById('notifications').checked,
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
        dailyLimit: parseFloat(document.getElementById('dailyLimit').value),
        language: document.getElementById('language').value
    };
    
    saveUserData();
    applySettings();
    showNotification('Settings updated successfully');
}

function applySettings() {
    // Apply theme
    document.body.className = appSettings.theme === 'dark' ? 'dark-theme' : '';
    
    // Update currency symbols throughout the app
    if (appSettings.currency === 'USD') {
        // Convert currency display (simplified)
        const rate = 0.012; // 1 INR = 0.012 USD (example rate)
        // This would require updating all currency displays
    }
}

function resetSettings() {
    appSettings = {
        theme: 'light',
        currency: 'INR',
        notifications: true,
        twoFactorAuth: false,
        dailyLimit: 50000,
        language: 'en'
    };
    
    loadSettingsData();
    applySettings();
    saveUserData();
    showNotification('Settings reset to default');
}

function exportData() {
    const exportData = {
        profile: userProfile,
        transactions: transactions,
        settings: appSettings,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `banking_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Data exported successfully');
}

// Event handlers
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        const response = await mockFetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = username;
            userProfile = getDefaultProfile();
            setBalance(result.balance);
            setGreeting(username);
            saveUserData();
            hideLoginModal();
            showNotification(result.message);
            showTab('dashboard');
            
            document.getElementById('loginForm').reset();
        } else {
            showNotification(result.message, 'error');
        }
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

function handleLogout() {
    clearUserData();
    showLoginModal();
    showNotification('Logged out successfully');
}

async function handleDeposit() {
    const amount = prompt('Enter amount to deposit (₹):');
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    try {
        const response = await mockFetch('/api/deposit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({amount: parseFloat(amount)})
        });
        
        const result = await response.json();
        
        if (result.success) {
            setBalance(result.balance);
            addTransaction('deposit', amount, 'Cash Deposit');
            showNotification(result.message);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Deposit error:', error);
        showNotification('Deposit failed. Please try again.', 'error');
    }
}

async function handleWithdraw() {
    const amount = prompt('Enter amount to withdraw (₹):');
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    if (parseFloat(amount) > appSettings.dailyLimit) {
        showNotification(`Amount exceeds daily limit of ₹${appSettings.dailyLimit}`, 'error');
        return;
    }
    
    if (parseFloat(amount) > currentBalance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    try {
        const response = await mockFetch('/api/withdraw', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({amount: parseFloat(amount)})
        });
        
        const result = await response.json();
        
        if (result.success) {
            setBalance(result.balance);
            addTransaction('withdraw', amount, 'Cash Withdrawal');
            showNotification(result.message);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Withdraw error:', error);
        showNotification('Withdrawal failed. Please try again.', 'error');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced Banking App Initialized');
    
    loadUserData();
    
    // Multiple possible selectors for each button type
    const buttonSelectors = {
        // Login form
        loginForm: ['#loginForm', 'form[name="loginForm"]', '.login-form'],
        
        // Logout buttons
        logout: ['#logoutBtn', '#logout', '.logout-btn', 'button[onclick*="logout"]', 'button[onclick*="Logout"]'],
        
        // Deposit buttons  
        deposit: ['#depositBtn', '#deposit', '.deposit-btn', 'button[onclick*="deposit"]', 'button[onclick*="Deposit"]'],
        
        // Withdraw buttons
        withdraw: ['#withdrawBtn', '#withdraw', '.withdraw-btn', 'button[onclick*="withdraw"]', 'button[onclick*="Withdraw"]'],
        
        // Profile related
        profile: ['#profileBtn', '#profile', '.profile-btn', 'button[onclick*="profile"]', 'button[onclick*="Profile"]'],
        profileForm: ['#profileForm', 'form[name="profileForm"]', '.profile-form'],
        
        // Analytics related
        analytics: ['#analyticsBtn', '#analytics', '.analytics-btn', 'button[onclick*="analytics"]', 'button[onclick*="Analytics"]'],
        
        // Settings related
        settings: ['#settingsBtn', '#settings', '.settings-btn', 'button[onclick*="settings"]', 'button[onclick*="Settings"]'],
        settingsForm: ['#settingsForm', 'form[name="settingsForm"]', '.settings-form'],
        resetSettings: ['#resetSettingsBtn', '#resetSettings', '.reset-settings-btn'],
        exportData: ['#exportDataBtn', '#exportData', '.export-data-btn']
    };
    
    // Helper function to find element by multiple selectors
    function findElement(selectors) {
        for (let selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`Found element with selector: ${selector}`);
                return element;
            }
        }
        return null;
    }
    
    // Login form handler
    const loginForm = findElement(buttonSelectors.loginForm);
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Profile form handler
    const profileForm = findElement(buttonSelectors.profileForm);
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Settings form handler
    const settingsForm = findElement(buttonSelectors.settingsForm);
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsUpdate);
    }
    
    // Button event listeners with multiple selector support
    const buttonHandlers = {
        logout: handleLogout,
        deposit: handleDeposit,
        withdraw: handleWithdraw,
        profile: () => showTab('profile'),
        analytics: () => showTab('analytics'), 
        settings: () => showTab('settings'),
        resetSettings: resetSettings,
        exportData: exportData
    };
    
    Object.entries(buttonHandlers).forEach(([buttonType, handler]) => {
        const button = findElement(buttonSelectors[buttonType]);
        if (button) {
            // Remove any existing onclick handlers
            button.removeAttribute('onclick');
            button.addEventListener('click', handler);
            console.log(`Attached ${buttonType} handler`);
        }
    });
    
    // Tab navigation - try multiple approaches
    let tabButtons = document.querySelectorAll('.nav-tab, [data-tab], .tab-btn');
    if (tabButtons.length === 0) {
        // If no tab buttons found, create virtual navigation
        console.log('No tab buttons found, using function-based navigation');
    } else {
        tabButtons.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab') || 
                              tab.getAttribute('data-target') || 
                              tab.textContent.toLowerCase().trim();
                showTab(tabName);
            });
        });
    }
    
    // Generic click handler for any button with text content
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('btn')) {
            const buttonText = e.target.textContent.toLowerCase().trim();
            
            // Handle buttons by their text content
            switch(buttonText) {
                case 'logout':
                case 'log out':
                    handleLogout();
                    break;
                case 'deposit':
                    handleDeposit();
                    break;
                case 'withdraw':
                    handleWithdraw();
                    break;
                case 'profile':
                    showTab('profile');
                    break;
                case 'analytics':
                    showTab('analytics');
                    break;
                case 'settings':
                    showTab('settings');
                    break;
                case 'export data':
                    exportData();
                    break;
                case 'reset settings':
                    resetSettings();
                    break;
            }
        }
    });
    
    // Close modal when clicking outside
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal && isLoggedIn()) {
                hideLoginModal();
            }
        });
    }
    
    // Handle Enter key in password field
    const passwordInput = document.getElementById('password') || document.querySelector('input[type="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const loginForm = findElement(buttonSelectors.loginForm);
                if (loginForm) {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
    
    // Debug information
    console.log('Button detection results:');
    Object.entries(buttonSelectors).forEach(([type, selectors]) => {
        const found = findElement(selectors);
        console.log(`${type}: ${found ? 'FOUND' : 'NOT FOUND'}`);
    });
});

// Export functions for external use
window.BankingApp = {
    showLoginModal,
    hideLoginModal,
    handleLogin,
    handleLogout,
    handleDeposit,
    handleWithdraw,
    showTab,
    isLoggedIn,
    getCurrentBalance: () => currentBalance,
    getCurrentUser: () => currentUser,
    getTransactions: () => transactions,
    getUserProfile: () => userProfile,
    getSettings: () => appSettings,
    exportData
};