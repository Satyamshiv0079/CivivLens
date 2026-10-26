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
  let color = '#2563EB'; // primary cobalt
  if (category === 'POTHOLE') color = '#D97706'; // amber
  if (category === 'GARBAGE') color = '#059669'; // emerald
  if (category === 'BROKEN_STREETLIGHT') color = '#CA8A04'; // yellow
  if (category === 'WATER_LEAKAGE') color = '#0284C7'; // sky

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="background-color: #ffffff; width: 7px; height: 7px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
};

const pickerPin = L.divIcon({
  className: 'picker-pin',
  html: `
    <div style="
      background-color: #2563EB;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.35), 0 3px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="background-color: #ffffff; width: 8px; height: 8px; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -16],
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
  center = [12.9716, 77.5946],
  zoom = 13,
  height = '460px',
  interactivePicker = false,
}) => {
  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-surfaceBorder shadow-subtle relative z-0"
      style={{ minHeight: '300px' }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
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
              <div className="text-xs p-1">
                <span className="font-bold text-navy">Pinned Location</span>
                <div className="font-mono text-slate-500 mt-0.5">
                  {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render reports markers */}
        {reports
          .filter((r) => r.latitude && r.longitude)
          .map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createCategoryIcon(report.category)}
            >
              <Popup>
                <div className="min-w-[210px] p-1.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {formatCategory(report.category)}
                    </span>
                    <StatusBadge status={report.status} />
                  </div>
                  <h4 className="font-bold text-navy text-sm leading-snug line-clamp-2">
                    {report.title}
                  </h4>
                  <p className="text-xs text-slate-text line-clamp-2">
                    {report.description}
                  </p>
                  {report.imageUrl && (
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-full h-24 object-cover rounded-lg border border-surfaceBorder"
                      loading="lazy"
                    />
                  )}
                  <div className="text-[11px] text-slate-400 truncate">
                    {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                  </div>
                  <Link
                    to={`/reports/${report.id}`}
                    className="block text-center py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-sm transition"
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
