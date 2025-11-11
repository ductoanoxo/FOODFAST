import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import PropTypes from 'prop-types'

const MapController = ({ center, zoom }) => {
    const map = useMap()

    useEffect(() => {
        if (center) {
            map.setView(center, zoom || map.getZoom())
        }
    }, [center, zoom, map])

    return null
}

MapController.propTypes = {
    center: PropTypes.arrayOf(PropTypes.number),
    zoom: PropTypes.number,
}

export default MapController
