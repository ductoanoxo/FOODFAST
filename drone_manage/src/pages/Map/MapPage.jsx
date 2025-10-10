import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Card } from 'antd'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const MapPage = () => {
  const center = [10.8231, 106.6297] // Ho Chi Minh City

  return (
    <div>
      <h1>Bản đồ theo dõi Drone</h1>
      <Card style={{ marginTop: 16 }}>
        <div style={{ height: '600px' }}>
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center}>
              <Popup>
                Vị trí mặc định <br /> HCM City
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </Card>
    </div>
  )
}

export default MapPage
