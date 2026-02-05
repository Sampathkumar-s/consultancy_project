import { useState, useEffect } from 'react'
import './App.css'
import { database, ref, onValue } from './firebase'

interface Vehicle {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  altitude?: number;
  satellites?: number;
  timestamp?: number;
  isOnline: boolean;
  lastSeen?: string;
}

function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Listen to all GPS devices
      const devicesRef = ref(database, 'gps_devices')
      
      const unsubscribe = onValue(
        devicesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const devicesData = snapshot.val()
            const vehiclesList: Vehicle[] = []

            Object.entries(devicesData).forEach(([deviceId, data]: [string, any]) => {
              const now = Date.now()
              const timestamp = data.timestamp || 0
              const timeDiff = now - timestamp
              const isOnline = timeDiff < 60000 // Online if data is less than 60 seconds old

              vehiclesList.push({
                id: deviceId,
                name: `Vehicle ${deviceId.replace('device_', '')}`,
                latitude: data.latitude || 0,
                longitude: data.longitude || 0,
                speed: data.speed || 0,
                altitude: data.altitude,
                satellites: data.satellites,
                timestamp: data.timestamp,
                isOnline: isOnline,
                lastSeen: timestamp ? new Date(timestamp).toLocaleString() : 'Never'
              })

              console.log(`✓ ${deviceId}:`, {
                name: `Vehicle ${deviceId.replace('device_', '')}`,
                lat: data.latitude,
                lng: data.longitude,
                speed: data.speed,
                status: isOnline ? 'ONLINE' : 'OFFLINE',
                lastSeen: timestamp ? new Date(timestamp).toLocaleString() : 'Never'
              })
            })

            setVehicles(vehiclesList.sort((a, b) => a.id.localeCompare(b.id)))
            setError(null)
          } else {
            setError('No GPS devices found in database')
            console.warn('⚠ No data found at gps_devices')
          }
          setLoading(false)
        },
        (error) => {
          setError(`Firebase Error: ${error.message}`)
          console.error('✗ Firebase error:', error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setError(`Connection Error: ${err}`)
      console.error('✗ Connection error:', err)
      setLoading(false)
    }
  }, [])

  return (
    <div className="dashboard">
      <div className="header">
        <h1>🚗 Vehicle GPS Tracking Dashboard</h1>
        <div className="stats">
          <span className="stat-item">
            Total Vehicles: <strong>{vehicles.length}</strong>
          </span>
          <span className="stat-item">
            Online: <strong className="online">{vehicles.filter(v => v.isOnline).length}</strong>
          </span>
          <span className="stat-item">
            Offline: <strong className="offline">{vehicles.filter(v => !v.isOnline).length}</strong>
          </span>
        </div>
      </div>

      {loading && <p className="status">⏳ Loading GPS data...</p>}

      {error && <p className="error">❌ {error}</p>}

      {!loading && vehicles.length > 0 && (
        <div className="vehicles-grid">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className={`vehicle-card ${vehicle.isOnline ? 'online' : 'offline'}`}>
              <div className="vehicle-header">
                <h2>{vehicle.name}</h2>
                <div className={`status-badge ${vehicle.isOnline ? 'online' : 'offline'}`}>
                  {vehicle.isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
                </div>
              </div>

              <div className="vehicle-content">
                <div className="data-row">
                  <span className="label">📍 Latitude:</span>
                  <span id={`lat-${vehicle.id}`} className="value">{vehicle.latitude.toFixed(6)}</span>
                </div>

                <div className="data-row">
                  <span className="label">📍 Longitude:</span>
                  <span id={`lng-${vehicle.id}`} className="value">{vehicle.longitude.toFixed(6)}</span>
                </div>

                <div className="data-row">
                  <span className="label">⚡ Speed:</span>
                  <span id={`speed-${vehicle.id}`} className="value highlight">
                    {vehicle.speed.toFixed(2)} km/h
                  </span>
                </div>

                {vehicle.satellites !== undefined && (
                  <div className="data-row">
                    <span className="label">🛰️ Satellites:</span>
                    <span id={`sats-${vehicle.id}`} className="value">{vehicle.satellites}</span>
                  </div>
                )}

                {vehicle.altitude !== undefined && (
                  <div className="data-row">
                    <span className="label">📏 Altitude:</span>
                    <span className="value">{vehicle.altitude.toFixed(2)} m</span>
                  </div>
                )}

                <div className="data-row">
                  <span className="label">🕐 Last Updated:</span>
                  <span className="value small">{vehicle.lastSeen}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && vehicles.length === 0 && !error && (
        <p className="empty">No vehicles available. Add GPS devices to Firebase.</p>
      )}
    </div>
  )
}

export default App
