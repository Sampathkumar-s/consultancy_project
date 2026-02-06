import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

interface Vehicle {
  id: string;
  number: string;
  driver: string;
  status: 'moving' | 'stopped' | 'idle' | 'offline';
  speed: string;
  location: string;
  coordinates: [number, number];
  lastUpdate: string;
  fuel: string;
  temperature: string;
}

interface User {
  password: string;
  role: string;
  avatarText: string;
}

const App: React.FC = () => {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if user was previously logged in
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('savedUsername') || '';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('savedPassword') || '';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('userAvatar') || 'A';
  });
  const [remember, setRemember] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true';
  });

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'list' | 'map'>('list');
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);

  // Map state
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // User accounts
  const userAccounts: Record<string, User> = {
    admin: { password: 'Password123!', role: 'Administrator', avatarText: 'A' },
    dispatcher: { password: 'Dispatch@2024', role: 'Dispatcher', avatarText: 'D' },
    manager: { password: 'Manager@2024', role: 'Manager', avatarText: 'M' }
  };

  // Vehicle data
  const vehicles: Vehicle[] = [
    {
      id: 'VH-001',
      number: 'KA-01-AB-1234',
      driver: 'Rajesh Kumar',
      status: 'moving',
      speed: '65 km/h',
      location: 'MG Road, Bangalore',
      coordinates: [12.9716, 77.5946],
      lastUpdate: '2 min ago',
      fuel: '78%',
      temperature: '24°C'
    },
    {
      id: 'VH-002',
      number: 'MH-02-CD-5678',
      driver: 'Suresh Patel',
      status: 'stopped',
      speed: '0 km/h',
      location: 'Nariman Point, Mumbai',
      coordinates: [19.0760, 72.8777],
      lastUpdate: '5 min ago',
      fuel: '45%',
      temperature: '28°C'
    },
    {
      id: 'VH-003',
      number: 'DL-03-EF-9012',
      driver: 'Amit Sharma',
      status: 'idle',
      speed: '0 km/h',
      location: 'Connaught Place, Delhi',
      coordinates: [28.6139, 77.2090],
      lastUpdate: '10 min ago',
      fuel: '92%',
      temperature: '22°C'
    },
    {
      id: 'VH-004',
      number: 'TN-04-GH-3456',
      driver: 'Karthik Reddy',
      status: 'moving',
      speed: '45 km/h',
      location: 'Marina Beach, Chennai',
      coordinates: [13.0827, 80.2707],
      lastUpdate: '1 min ago',
      fuel: '34%',
      temperature: '30°C'
    },
    {
      id: 'VH-005',
      number: 'GJ-05-IJ-7890',
      driver: 'Vikram Joshi',
      status: 'offline',
      speed: 'N/A',
      location: 'Sabarmati, Ahmedabad',
      coordinates: [23.0225, 72.5714],
      lastUpdate: '1 hour ago',
      fuel: '15%',
      temperature: 'N/A'
    },
    {
      id: 'VH-006',
      number: 'WB-06-KL-2345',
      driver: 'Sourav Das',
      status: 'moving',
      speed: '55 km/h',
      location: 'Howrah Bridge, Kolkata',
      coordinates: [22.5726, 88.3639],
      lastUpdate: '3 min ago',
      fuel: '67%',
      temperature: '26°C'
    }
  ];

  // Initialize from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUser');
    if (savedUsername) {
      setUsername(savedUsername);
      setRemember(true);
    }
  }, []);

  // Show message with auto-hide
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    const user = userAccounts[username.toLowerCase()];
    if (user && user.password === password) {
      setUserAvatar(user.avatarText);
      setIsLoggedIn(true);
      
      // Save to localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('savedUsername', username);
      localStorage.setItem('savedPassword', password);
      localStorage.setItem('userAvatar', user.avatarText);
      
      if (remember) {
        localStorage.setItem('rememberedUser', username);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedUser');
        localStorage.setItem('rememberMe', 'false');
      }
      showMessage('Login successful!', 'success');
    } else {
      showMessage(user ? 'Incorrect password' : 'Username not found', 'error');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
    setCurrentPage('list');
    
    // Clear from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('savedUsername');
    localStorage.removeItem('savedPassword');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('rememberMe');
  };

  // Get status icon
  const getStatusIcon = (status: Vehicle['status']) => {
    const icons: Record<Vehicle['status'], string> = {
      moving: 'fas fa-play',
      stopped: 'fas fa-pause',
      idle: 'fas fa-clock',
      offline: 'fas fa-power-off'
    };
    return icons[status];
  };

  // Get status color
  const getStatusColor = (status: Vehicle['status']) => {
    const colors: Record<Vehicle['status'], string> = {
      moving: '#38a169',
      stopped: '#e53e3e',
      idle: '#d69e2e',
      offline: '#a0aec0'
    };
    return colors[status];
  };

  // Get status badge color
  const getStatusClass = (status: Vehicle['status']) => {
    const classes: Record<Vehicle['status'], string> = {
      moving: 'status-moving',
      stopped: 'status-stopped',
      idle: 'status-idle',
      offline: 'status-offline'
    };
    return classes[status];
  };

  // Initialize map
  const initMap = (vehicle: Vehicle) => {
    if (mapRef.current) {
      mapRef.current.remove();
    }

    mapRef.current = L.map('vehicleMap').setView(vehicle.coordinates, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    addVehicleMarker(vehicle);
  };

  // Add vehicle marker
  const addVehicleMarker = (vehicle: Vehicle) => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }

    const iconHtml = `<div style="
      background: ${getStatusColor(vehicle.status)};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    "><i class="fas fa-truck"></i></div>`;

    const icon = L.divIcon({
      html: iconHtml,
      className: 'vehicle-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    markerRef.current = L.marker(vehicle.coordinates, { icon })
      .addTo(mapRef.current!)
      .bindPopup(`
        <div style="padding: 10px;">
          <h4 style="margin: 0 0 5px 0;">${vehicle.number}</h4>
          <p style="margin: 0 0 5px 0;">Driver: ${vehicle.driver}</p>
          <p style="margin: 0 0 5px 0;">Status: ${vehicle.status}</p>
          <p style="margin: 0 0 5px 0;">Speed: ${vehicle.speed}</p>
          <p style="margin: 0 0 5px 0;">Location: ${vehicle.location}</p>
        </div>
      `);
  };

  // Show vehicle on map
  const showVehicleOnMap = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    setCurrentVehicle(vehicle);
    setCurrentPage('map');
    
    setTimeout(() => {
      initMap(vehicle);
    }, 100);
  };

  // Map controls
  const handleZoom = (type: 'in' | 'out') => {
    if (mapRef.current) {
      mapRef.current.zoomBy(type === 'in' ? 1 : -1);
    }
  };

  const handleLocateVehicle = () => {
    if (mapRef.current && currentVehicle) {
      mapRef.current.setView(currentVehicle.coordinates, 15);
    }
  };

  const handleFullscreen = () => {
    const elem = document.getElementById('vehicleMap');
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>Vehicle Tracking System</h1>
            </div>
            <div className="login-form">
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-with-icon">
                    <i className="fas fa-user"></i>
                    <input
                      type="text"
                      id="username"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-with-icon password-container">
                    <i className="fas fa-lock"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                    </button>
                  </div>
                </div>

                <div className="remember-forgot">
                  <div className="remember">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <a href="#" className="forgot" onClick={(e) => {
                    e.preventDefault();
                    showMessage('Password reset link would be sent to registered email', 'success');
                  }}>Forgot password?</a>
                </div>

                <button type="submit" className="btn-login">Sign In</button>

                {message && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-list-page">
      {/* Header */}
      <div className="header">
        <button className="burger-menu" onClick={() => setSidebarOpen(true)}>
          <i className="fas fa-bars"></i>
        </button>
        <div className="logo">
          <i className="fas fa-car"></i>
          <h1>Vehicle Tracker</h1>
        </div>
        <div className="user-info">
          <div className="user-avatar">{userAvatar}</div>
          <button className="btn-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-section">
          <h3>Navigation</h3>
          <div className="nav-item active">
            <i className="fas fa-car"></i>
            <span>Vehicle List</span>
          </div>
          <div className="nav-item">
            <i className="fas fa-history"></i>
            <span>History</span>
          </div>
          <div className="nav-item">
            <i className="fas fa-chart-bar"></i>
            <span>Reports</span>
          </div>
          <div className="nav-item">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Quick Stats</h3>
          <div style={{ padding: '10px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '10px', height: '10px', background: '#38a169', borderRadius: '50%', marginRight: '10px' }}></div>
              <span style={{ fontSize: '0.9rem' }}>Moving: <strong>8</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '10px', height: '10px', background: '#e53e3e', borderRadius: '50%', marginRight: '10px' }}></div>
              <span style={{ fontSize: '0.9rem' }}>Stopped: <strong>4</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '10px', height: '10px', background: '#a0aec0', borderRadius: '50%', marginRight: '10px' }}></div>
              <span style={{ fontSize: '0.9rem' }}>Offline: <strong>2</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentPage === 'list' ? (
        <div className="vehicle-list-container">
          <h1 className="page-title">Fleet Vehicles</h1>

          <div className="stats-cards">
            <div className="stat-card stat-1">
              <div className="stat-header">
                <div>
                  <div className="stat-value">14</div>
                  <div className="stat-label">Total Vehicles</div>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-truck"></i>
                </div>
              </div>
            </div>

            <div className="stat-card stat-2">
              <div className="stat-header">
                <div>
                  <div className="stat-value">8</div>
                  <div className="stat-label">Active Now</div>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-play-circle"></i>
                </div>
              </div>
            </div>

            <div className="stat-card stat-3">
              <div className="stat-header">
                <div>
                  <div className="stat-value">94%</div>
                  <div className="stat-label">Online</div>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-wifi"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-header">
                  <div className="vehicle-icon">
                    <i className="fas fa-truck"></i>
                  </div>
                  <div className="vehicle-number">{vehicle.number}</div>
                </div>
                <div className="vehicle-body">
                  <div className="vehicle-info">
                    <div className="info-item">
                      <label>Driver</label>
                      <div className="value">{vehicle.driver}</div>
                    </div>
                    <div className="info-item">
                      <label>Status</label>
                      <div className="value">
                        <span className={`vehicle-status ${getStatusClass(vehicle.status)}`}>
                          <i className={getStatusIcon(vehicle.status)}></i>
                          {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Speed</label>
                      <div className="value">{vehicle.speed}</div>
                    </div>
                    <div className="info-item">
                      <label>Location</label>
                      <div className="value">{vehicle.location}</div>
                    </div>
                  </div>
                  <button className="track-btn" onClick={() => showVehicleOnMap(vehicle.id)}>
                    <i className="fas fa-map-marker-alt"></i> Track on Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="map-page">
          {/* Map Header */}
          <div className="map-header">
            <button className="back-btn" onClick={() => setCurrentPage('list')}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="vehicle-details">
              <h2>Vehicle {currentVehicle?.number}</h2>
              <p>Live Tracking • Last updated: {currentVehicle?.lastUpdate}</p>
            </div>
            <div className="user-info">
              <div className="user-avatar">{userAvatar}</div>
              <button className="btn-logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div className="map-container">
            <div id="vehicleMap" className="vehicle-map"></div>

            {/* Map Controls */}
            <div className="map-controls">
              <button className="map-btn" onClick={() => handleZoom('in')}>
                <i className="fas fa-plus"></i>
              </button>
              <button className="map-btn" onClick={() => handleZoom('out')}>
                <i className="fas fa-minus"></i>
              </button>
              <button className="map-btn" onClick={handleLocateVehicle}>
                <i className="fas fa-crosshairs"></i>
              </button>
              <button className="map-btn" onClick={handleFullscreen}>
                <i className="fas fa-expand"></i>
              </button>
            </div>

            {/* Vehicle Info Sidebar */}
            {currentVehicle && (
              <div className="map-sidebar">
                <div className="map-vehicle-info">
                  <h3>{currentVehicle.number}</h3>

                  <div className="map-info-grid">
                    <div className="map-info-item">
                      <label>Status</label>
                      <div className="value">
                        <span className={`vehicle-status ${getStatusClass(currentVehicle.status)}`}>
                          <i className={getStatusIcon(currentVehicle.status)}></i>
                          {currentVehicle.status.charAt(0).toUpperCase() + currentVehicle.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="map-info-item">
                      <label>Speed</label>
                      <div className="value">{currentVehicle.speed}</div>
                    </div>
                    <div className="map-info-item">
                      <label>Driver</label>
                      <div className="value">{currentVehicle.driver}</div>
                    </div>
                    <div className="map-info-item">
                      <label>Location</label>
                      <div className="value">{currentVehicle.location}</div>
                    </div>
                  </div>

                  <div className="vehicle-actions">
                    <button className="action-btn primary" onClick={() => alert(`Calling driver: ${currentVehicle.driver}`)}>
                      <i className="fas fa-phone"></i> Call
                    </button>
                    <button className="action-btn secondary" onClick={() => alert(`Showing history for vehicle: ${currentVehicle.number}`)}>
                      <i className="fas fa-history"></i> History
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
