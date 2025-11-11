import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

const MapController = ({ center, zoom }) => {
    const map = useMap()

    useEffect(() => {
        if (center) {
            map.setView(center, zoom || map.getZoom())
        }
    }, [center, zoom, map])

    return null
}

export default MapController
