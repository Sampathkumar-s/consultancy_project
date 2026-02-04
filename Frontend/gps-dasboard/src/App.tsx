import { useState, useEffect } from 'react'
import './App.css'
import { database, ref, onValue } from './firebase'

interface GPSData {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

function App() {
  const [gpsData, setGpsData] = useState<GPSData>({
    latitude: 0,
    longitude: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Reference to your GPS data in Firebase Realtime Database
      // Adjust the path based on your database structure
      const gpsRef = ref(database, 'gps/current')
      
      const unsubscribe = onValue(
        gpsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val()
            setGpsData({
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              timestamp: data.timestamp
            })
            setError(null)
          } else {
            setError('No GPS data available')
          }
          setLoading(false)
        },
        (error) => {
          setError(`Error loading data: ${error.message}`)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setError(`Connection error: ${err}`)
      setLoading(false)
    }
  }, [])

  return (
    <div className="dashboard">
      <h1>GPS Dashboard</h1>
      
      {loading && <p className="status">Loading GPS data...</p>}
      
      {error && <p className="error">{error}</p>}
      
      {!loading && !error && (
        <div className="gps-container">
          <div className="gps-card">
            <div className="gps-value">
              <label>Latitude:</label>
              <p className="coordinate">{gpsData.latitude.toFixed(6)}</p>
            </div>
          </div>
          
          <div className="gps-card">
            <div className="gps-value">
              <label>Longitude:</label>
              <p className="coordinate">{gpsData.longitude.toFixed(6)}</p>
            </div>
          </div>

          {gpsData.timestamp && (
            <div className="timestamp">
              <small>Last updated: {new Date(gpsData.timestamp).toLocaleString()}</small>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
