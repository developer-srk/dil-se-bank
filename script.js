// Banking App JavaScript Code

// Global state
let currentUser = null;
let currentBalance = 0;
let transactions = [];

// Mock API functions
async function mockFetch(url, options) {
    // Simulate network delay
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
        timestamp: new Date().toLocaleString()
    };
    
    transactions.unshift(transaction);
    updateTransactionHistory();
    
    // Store in localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
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
    // Create notification element
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
    
    // Fade in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
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
    return localStorage.getItem('loggedIn') === 'true';
}

function loadUserData() {
    if (isLoggedIn()) {
        currentUser = localStorage.getItem('username') || 'User';
        currentBalance = parseFloat(localStorage.getItem('balance') || 0);
        transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        setGreeting(currentUser);
        setBalance(currentBalance);
        updateTransactionHistory();
        hideLoginModal();
    } else {
        showLoginModal();
    }
}

function saveUserData() {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('username', currentUser);
    localStorage.setItem('balance', currentBalance.toString());
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function clearUserData() {
    localStorage.clear();
    currentUser = null;
    currentBalance = 0;
    transactions = [];
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
        // Show loading state
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
            setBalance(result.balance);
            setGreeting(username);
            saveUserData();
            hideLoginModal();
            showNotification(result.message);
            
            // Clear form
            document.getElementById('loginForm').reset();
        } else {
            showNotification(result.message, 'error');
        }
        
        // Restore button
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
            saveUserData();
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
            saveUserData();
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
    console.log('Banking App Initialized');
    
    // Load user data and show appropriate UI
    loadUserData();
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Deposit button handler
    const depositBtn = document.getElementById('depositBtn');
    if (depositBtn) {
        depositBtn.addEventListener('click', handleDeposit);
    }
    
    // Withdraw button handler
    const withdrawBtn = document.getElementById('withdrawBtn');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', handleWithdraw);
    }
    
    // Close modal when clicking outside
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                // Only close if user is already logged in
                if (isLoggedIn()) {
                    hideLoginModal();
                }
            }
        });
    }
    
    // Handle Enter key in password field
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
});

// Export functions for external use (optional)
window.BankingApp = {
    showLoginModal,
    hideLoginModal,
    handleLogin,
    handleLogout,
    handleDeposit,
    handleWithdraw,
    isLoggedIn,
    getCurrentBalance: () => currentBalance,
    getCurrentUser: () => currentUser,
    getTransactions: () => transactions
};