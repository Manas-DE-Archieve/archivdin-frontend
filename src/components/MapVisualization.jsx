// frontend/src/components/MapVisualization.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON } from 'react-leaflet';

const REGIONS_GEO = [
  { name: 'Чуйская область', lat: 42.87, lng: 74.59, count: 0 },
  { name: 'Иссык-Кульская область', lat: 42.45, lng: 77.40, count: 0 },
  { name: 'Нарынская область', lat: 41.43, lng: 75.99, count: 0 },
  { name: 'Джалал-Абадская область', lat: 40.93, lng: 72.98, count: 0 },
  { name: 'Ошская область', lat: 40.51, lng: 72.80, count: 0 },
  { name: 'Баткенская область', lat: 39.96, lng: 70.82, count: 0 },
  { name: 'Таласская область', lat: 42.52, lng: 72.24, count: 0 },
];

export default function MapVisualization({ persons = [] }) {
  const { t } = useTranslation();
  const [kgBorder, setKgBorder] = useState(null);
  const [regionsBorder, setRegionsBorder] = useState(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/KGZ.geo.json')
      .then(res => res.json())
      .then(data => setKgBorder(data))
      .catch(err => console.error('Ошибка загрузки границ КР:', err));

    fetch('https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/KGZ/ADM1/geoBoundaries-KGZ-ADM1_simplified.geojson')
      .then(res => res.json())
      .then(data => setRegionsBorder(data))
      .catch(err => console.error('Ошибка загрузки границ областей:', err));
  }, []);

  const counts = {};
  persons.forEach(p => { if (p.region) counts[p.region] = (counts[p.region] || 0) + 1 });
  const maxCount = Math.max(1, ...Object.values(counts));

  const regions = REGIONS_GEO.map(r => ({ ...r, count: counts[r.name] || 0 }));

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('map.title')}</h3>
      <div className="w-full h-[260px] rounded-lg overflow-hidden border border-slate-200 z-0 relative shadow-inner bg-slate-100">
        <MapContainer
          center={[41.2, 74.5]}
          zoom={5.5}
          minZoom={4}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          scrollWheelZoom={true}
          wheelPxPerZoomLevel={120}
          zoomSnap={0.5}
          zoomDelta={0.5}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {regionsBorder && (
            <GeoJSON
              data={regionsBorder}
              style={{ color: '#a1a1aa', weight: 1, opacity: 0.7, dashArray: '4, 4', fillOpacity: 0 }}
            />
          )}
          {kgBorder && (
            <GeoJSON
              data={kgBorder}
              style={{ color: '#334155', weight: 2, opacity: 0.8, fillColor: '#f1f5f9', fillOpacity: 0.05 }}
            />
          )}
          {regions.filter(r => r.count > 0).map(r => {
            const radius = 8 + (r.count / maxCount) * 14;
            return (
              <CircleMarker
                key={r.name}
                center={[r.lat, r.lng]}
                pathOptions={{ color: '#ffffff', fillColor: '#4f46e5', fillOpacity: 0.8, weight: 1.5 }}
                radius={radius}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95} className="!rounded-md !border-none !shadow-md !text-slate-800">
                  <div className="text-center">
                    <span className="font-bold block mb-0.5 text-sm">{r.name}</span>
                    <span className="text-xs text-slate-500">
                      Репрессировано: <strong className="text-primary-700">{r.count}</strong>
                    </span>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {regions.filter(r => r.count > 0).sort((a, b) => b.count - a.count).map(r => (
          <span key={r.name} className="text-xs text-slate-500">
            {r.name.replace(' область', '')}: <strong className="text-primary-600">{r.count}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}