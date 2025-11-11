import { Polyline } from 'react-leaflet'

const RoutePolyline = ({ positions, color = '#1890ff', weight = 3, opacity = 0.7 }) => {
    if (!positions || positions.length < 2) {
        return null
    }

    return (
        <Polyline
            positions={positions}
            pathOptions={{
                color: color,
                weight: weight,
                opacity: opacity,
                dashArray: '10, 10',
            }}
        />
    )
}

export default RoutePolyline
