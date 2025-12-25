// ========== CONFIGURATION ==========
const userAccounts = {
    "admin": {
        password: "Password123!",
        role: "Administrator",
        avatarText: "A"
    },
    "dispatcher": {
        password: "Dispatch@2024",
        role: "Dispatcher",
        avatarText: "D"
    },
    "manager": {
        password: "Manager@2024",
        role: "Manager",
        avatarText: "M"
    }
};

// Vehicle data with real locations
const vehicles = [
    {
        id: "VH-001",
        number: "KA-01-AB-1234",
        driver: "Rajesh Kumar",
        status: "moving",
        speed: "65 km/h",
        location: "MG Road, Bangalore",
        coordinates: [12.9716, 77.5946],
        lastUpdate: "2 min ago",
        fuel: "78%",
        temperature: "24°C"
    },
    {
        id: "VH-002",
        number: "MH-02-CD-5678",
        driver: "Suresh Patel",
        status: "stopped",
        speed: "0 km/h",
        location: "Nariman Point, Mumbai",
        coordinates: [19.0760, 72.8777],
        lastUpdate: "5 min ago",
        fuel: "45%",
        temperature: "28°C"
    },
    {
        id: "VH-003",
        number: "DL-03-EF-9012",
        driver: "Amit Sharma",
        status: "idle",
        speed: "0 km/h",
        location: "Connaught Place, Delhi",
        coordinates: [28.6139, 77.2090],
        lastUpdate: "10 min ago",
        fuel: "92%",
        temperature: "22°C"
    },
    {
        id: "VH-004",
        number: "TN-04-GH-3456",
        driver: "Karthik Reddy",
        status: "moving",
        speed: "45 km/h",
        location: "Marina Beach, Chennai",
        coordinates: [13.0827, 80.2707],
        lastUpdate: "1 min ago",
        fuel: "34%",
        temperature: "30°C"
    },
    {
        id: "VH-005",
        number: "GJ-05-IJ-7890",
        driver: "Vikram Joshi",
        status: "offline",
        speed: "N/A",
        location: "Sabarmati, Ahmedabad",
        coordinates: [23.0225, 72.5714],
        lastUpdate: "1 hour ago",
        fuel: "15%",
        temperature: "N/A"
    },
    {
        id: "VH-006",
        number: "WB-06-KL-2345",
        driver: "Sourav Das",
        status: "moving",
        speed: "55 km/h",
        location: "Howrah Bridge, Kolkata",
        coordinates: [22.5726, 88.3639],
        lastUpdate: "3 min ago",
        fuel: "67%",
        temperature: "26°C"
    }
];

// ========== DOM ELEMENTS ==========
const loginPage = document.getElementById('loginPage');
const vehicleListPage = document.getElementById('vehicleListPage');
const mapPage = document.getElementById('mapPage');
const vehicleGrid = document.getElementById('vehicleGrid');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const burgerMenu = document.getElementById('burgerMenu');
const backBtn = document.getElementById('backBtn');
const logoutBtns = document.querySelectorAll('.btn-logout');
const togglePassword = document.getElementById('togglePassword');
const loginForm = document.getElementById('loginForm');

// Map elements
let vehicleMap = null;
let currentVehicleMarker = null;
let currentVehicle = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    checkRememberedUser();
});

// ========== EVENT LISTENERS SETUP ==========
function initializeEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Toggle password visibility
    togglePassword.addEventListener('click', togglePasswordVisibility);
    
    // Forgot password link
    document.querySelector('.forgot').addEventListener('click', handleForgotPassword);
    
    // Remember me checkbox
    document.getElementById('remember').addEventListener('change', handleRememberMe);
    
    // Burger menu toggle
    burgerMenu.addEventListener('click', toggleSidebar);
    
    // Sidebar overlay click
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Back button from map to vehicle list
    backBtn.addEventListener('click', goBackToList);
    
    // Logout buttons
    logoutBtns.forEach(btn => btn.addEventListener('click', handleLogout));
    
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    
    // Map control buttons
    setupMapControls();
}

// ========== LOGIN FUNCTIONS ==========
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('message');
    
    // Clear previous messages
    messageEl.className = 'message';
    messageEl.textContent = '';
    
    // Validation
    if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Check credentials
    if (userAccounts.hasOwnProperty(username.toLowerCase())) {
        const user = userAccounts[username.toLowerCase()];
        
        if (password === user.password) {
            // Successful login
            showMessage('Login successful! Loading vehicle list...', 'success');
            
            // Update user info
            updateUserInfo(user);
            
            // Switch to vehicle list page after delay
            setTimeout(() => {
                loginPage.style.display = 'none';
                vehicleListPage.style.display = 'block';
                loadVehicleList();
            }, 1500);
            
        } else {
            showMessage('Incorrect password. Please try again.', 'error');
            shakeElement(document.getElementById('password'));
        }
    } else {
        showMessage('Username not found. Try: admin, dispatcher, or manager', 'error');
    }
}

function updateUserInfo(user) {
    const userAvatar = document.getElementById('userAvatar');
    const mapUserAvatar = document.getElementById('mapUserAvatar');
    
    if (userAvatar) userAvatar.textContent = user.avatarText;
    if (mapUserAvatar) mapUserAvatar.textContent = user.avatarText;
}

// ========== VEHICLE LIST FUNCTIONS ==========
function loadVehicleList() {
    vehicleGrid.innerHTML = '';
    
    // Calculate stats
    updateVehicleStats();
    
    // Create