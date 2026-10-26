import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CivicReport, IssueCategory } from '../types';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { formatCategory } from './ReportCard';

interface MapViewProps {
  reports?: CivicReport[];
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect?: (coords: { lat: number; lng: number }) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  interactivePicker?: boolean;
}

// Generate colored HTML marker pin based on category
const createCategoryIcon = (category: IssueCategory) => {
  let color = '#3b82f6'; // default blue
  if (category === 'POTHOLE') color = '#ef4444'; // red
  if (category === 'GARBAGE') color = '#10b981'; // emerald
  if (category === 'BROKEN_STREETLIGHT') color = '#f59e0b'; // amber
  if (category === 'WATER_LEAKAGE') color = '#06b6d4'; // cyan

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const pickerPin = L.divIcon({
  className: 'picker-pin',
  html: `
    <div style="
      background-color: #2563eb;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: bounce 1s infinite alternate;
    ">
      <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Component to handle map clicks for coordinate selection
const LocationPicker: React.FC<{ onSelect: (coords: { lat: number; lng: number }) => void }> = ({
  onSelect,
}) => {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

// Auto-recenter when center prop updates
const RecenterMap: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  reports = [],
  selectedLocation,
  onLocationSelect,
  center = [12.9716, 77.5946], // Default Bangalore / City coordinates
  zoom = 13,
  height = '450px',
  interactivePicker = false,
}) => {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} zoom={zoom} />

        {/* Click-to-pick location */}
        {interactivePicker && onLocationSelect && (
          <LocationPicker onSelect={onLocationSelect} />
        )}

        {/* Selected location marker during report submission */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={pickerPin}>
            <Popup>
              <div className="text-xs font-semibold text-gray-800">
                Selected Issue Location: <br />
                <span className="font-mono font-normal">
                  {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render reports markers */}
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createCategoryIcon(report.category)}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500">
                    {formatCategory(report.category)}
                  </span>
                  <StatusBadge status={report.status} />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1 leading-snug">
                  {report.title}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {report.description}
                </p>
                {report.imageUrl && (
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                )}
                <div className="text-[11px] text-gray-500 mb-2 truncate">
                  {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                </div>
                <Link
                  to={`/reports/${report.id}`}
                  className="block text-center py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
