import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Vehicle {
  id: string
  name: string
  latitude: number
  longitude: number
  speed: number
  lastSeen?: string
  isOnline: boolean
}

// Ensure default Leaflet icons load correctly with Vite
const createDefaultIcon = () => {
  const iconRetina = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href
  const icon = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href
  const shadow = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href

  return L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: shadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

L.Marker.prototype.options.icon = createDefaultIcon()

const FitBounds: React.FC<{ vehicles: Vehicle[] }> = ({ vehicles }) => {
  const map = useMap()

  useEffect(() => {
    if (!map || vehicles.length === 0) return

    const points = vehicles.map(v => [v.latitude, v.longitude] as [number, number])
    const bounds = L.latLngBounds(points)
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] })
  }, [vehicles, map])

  return null
}

const MapView: React.FC<{ vehicles: Vehicle[] }> = ({ vehicles }) => {
  const center: [number, number] = vehicles.length ? [vehicles[0].latitude, vehicles[0].longitude] : [0, 0]

  return (
    <MapContainer center={center} zoom={12} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds vehicles={vehicles} />

      {vehicles.map(v => (
        <Marker key={v.id} position={[v.latitude, v.longitude]}>
          <Popup>
            <div>
              <strong>{v.name}</strong>
              <br />Speed: {v.speed.toFixed(2)} km/h
              <br />Last: {v.lastSeen ?? 'Unknown'}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapView
