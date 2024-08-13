import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-rotatedmarker';

const startIcon = L.icon({
    iconUrl: '/start.png',
    iconSize: [30, 30], 
});

const endIcon = L.icon({
    iconUrl: '/end.png',
    iconSize: [30, 30], 
});

const calculateBearing = (start, end) => {
    if (!start || !end || typeof start.lat !== 'number' || typeof start.lng !== 'number' || typeof end.lat !== 'number' || typeof end.lng !== 'number') {
        console.error('Invalid coordinates provided to calculateBearing');
        return 0;
    }

    const startLat = (start.lat * Math.PI) / 180;
    const startLng = (start.lng * Math.PI) / 180;
    const endLat = (end.lat * Math.PI) / 180;
    const endLng = (end.lng * Math.PI) / 180;

    const dLng = endLng - startLng;

    const x = Math.sin(dLng) * Math.cos(endLat);
    const y =
        Math.cos(startLat) * Math.sin(endLat) -
        Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    let bearing = Math.atan2(x, y);
    bearing = (bearing * 180) / Math.PI; // Convert from radians to degrees
    bearing = (bearing + 360) % 360; // Normalize to 0-360 degrees

    return bearing;
};

const vesselIcon = L.icon({
    iconUrl: '/vessel.png',
    iconSize: [10, 40], // Adjust the size for visibility
    iconAnchor: [20, 20], // Center the icon
});

const moveTowards = (current, target, maxStep) => {
    const deltaLat = target.lat - current.lat;
    const deltaLng = target.lng - current.lng;
    const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);

    // If the step is larger than the distance, move directly to the target
    if (distance <= maxStep) {
        return target;
    }

    const ratio = maxStep / distance;
    return {
        lat: current.lat + deltaLat * ratio,
        lng: current.lng + deltaLng * ratio,
    };
};

const MapView = ({ startCoords, endCoords, speed }) => {
    const [position, setPosition] = useState(startCoords);
    const [bearing, setBearing] = useState(calculateBearing(startCoords, endCoords));
    const markerRef = useRef(null);

    useEffect(() => {
        if (!startCoords || !endCoords || speed <= 0) return;

        const intervalTime = 100; // 2FPS
        const maxStep = speed / 7200; // Convert speed to km per 500ms (1/2 second)

        let currentPos = { ...startCoords };

        const interval = setInterval(() => {
            if (currentPos.lat !== endCoords.lat || currentPos.lng !== endCoords.lng) {
                currentPos = moveTowards(currentPos, endCoords, maxStep);
                setPosition(currentPos);
                setBearing(calculateBearing(currentPos, endCoords));

                if (markerRef.current) {
                    markerRef.current.setLatLng(currentPos);
                    markerRef.current.setRotationAngle(bearing);
                }
            } else {
                clearInterval(interval);
            }
        }, intervalTime);

        return () => clearInterval(interval);
    }, [startCoords, endCoords, speed]);

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng(position);
            markerRef.current.setRotationAngle(bearing);
        }
    }, [position, bearing]);

    return (
        <MapContainer center={position} zoom={10} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={startCoords} icon={startIcon} />
            <Marker position={endCoords} icon={endIcon} />

            <Marker
                ref={markerRef}
                position={position}
                icon={vesselIcon}
                rotationAngle={bearing}
            />
        </MapContainer>
    );
};

export default MapView;
