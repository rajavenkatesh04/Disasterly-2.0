"use client";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ disasters = [] }) { // Default to empty array
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (!mapInstanceRef.current && mapRef.current) {
            // Initialize map
            mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2);

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);

            // Add markers for each disaster
            disasters.forEach(disaster => {
                const marker = L.circleMarker([disaster.lat, disaster.lng], {
                    radius: getRadius(disaster.magnitude),
                    fillOpacity: 0.7,
                    color: getColor(disaster.magnitude),
                    weight: 1
                }).addTo(mapInstanceRef.current);

                marker.bindPopup(`
                    <h3>${disaster.title}</h3>
                    <p>${disaster.description}</p>
                    <p><strong>Date:</strong> ${new Date(disaster.date).toLocaleString()}</p>
                    ${disaster.url ? `<p><a href="${disaster.url}" target="_blank" rel="noopener noreferrer">More Info</a></p>` : ''}
                `);
            });

            // Add legend
            const legend = L.control({ position: 'bottomleft' });
            legend.onAdd = () => {
                const div = L.DomUtil.create('div', 'info legend');
                div.innerHTML = `
                    <h4>Legend</h4>
                    <div><span style="background: #d7191c"></span>Major Earthquake (6.0+)</div>
                    <div><span style="background: #fdae61"></span>Moderate Earthquake (5.0-5.9)</div>
                    <div><span style="background: #0000ff"></span>Tsunami Warning</div>
                    <div><span style="background: #ff4500"></span>Active Fire</div>
                    <div><span style="background: #800080"></span>Severe Weather</div>
                `;
                return div;
            };
            legend.addTo(mapInstanceRef.current);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [disasters]);

    const getColor = (magnitude) => {
        if (magnitude >= 6.0) return "#d7191c";
        if (magnitude >= 5.0) return "#fdae61";
        if (magnitude >= 4.0) return "#ffffbf";
        return "#1a9641";
    };

    const getRadius = (magnitude) => {
        return Math.max(magnitude * 3, 5);
    };

    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}