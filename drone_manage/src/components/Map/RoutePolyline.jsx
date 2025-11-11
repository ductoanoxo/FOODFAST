import { Polyline } from 'react-leaflet'
import PropTypes from 'prop-types'

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

RoutePolyline.propTypes = {
    positions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    color: PropTypes.string,
    weight: PropTypes.number,
    opacity: PropTypes.number,
}

export default RoutePolyline
