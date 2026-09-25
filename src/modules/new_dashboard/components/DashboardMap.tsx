import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Maximize2, Minimize2 } from 'lucide-react';

import { formatCompactCurrency } from './Formatters';
import { CUSTOMERS_RISK, COLORS } from '../lib/constants';

const DashboardMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Resize map when fullscreen toggles
  useEffect(() => {
    if (map.current) {
        setTimeout(() => {
            map.current?.resize();
        }, 300); // Wait for transition
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    try {
        // We use a custom style object to use CartoDB Positron tiles (Free, No Token, Pro Look)
        const mapStyle = {
            version: 8,
            sources: {
                'raster-tiles': {
                    type: 'raster',
                    tiles: [
                        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
                    ],
                    tileSize: 256,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                }
            },
            layers: [
                {
                    id: 'simple-tiles',
                    type: 'raster',
                    source: 'raster-tiles',
                    minzoom: 0,
                    maxzoom: 22
                }
            ]
        };

        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: mapStyle as any, 
          center: [-74.2973, 4.5709], 
          zoom: 5,
          pitch: 0, // Flat view looks cleaner with raster tiles
        });

        map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

        map.current.on('error', (e) => {
            console.error("MapLibre error:", e);
            if (e.error && e.error.message && !e.error.message.includes('404')) {
                 setError("Error loading map resources.");
            }
        });

        map.current.on('load', () => {
          if (!map.current) return;

          const features = CUSTOMERS_RISK.map(customer => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [customer.lng, customer.lat]
            },
            properties: {
              id: customer.id,
              name: customer.name,
              portfolio: customer.portfolio,
              risk: customer.risk,
              formattedPortfolio: formatCompactCurrency(customer.portfolio)
            }
          }));

          const geoJsonData: any = {
            type: 'FeatureCollection',
            features: features
          };

          map.current.addSource('customers', {
            type: 'geojson',
            data: geoJsonData
          });

          map.current.addLayer({
            id: 'customer-circles',
            type: 'circle',
            source: 'customers',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'portfolio'],
                1000000000, 6,
                18000000000, 30
              ],
              'circle-color': [
                'match',
                ['get', 'risk'],
                'Alto', COLORS.riskHigh,
                'Medio alto', COLORS.riskMediumHigh,
                'Medio', COLORS.riskMedium,
                'Medio bajo', COLORS.riskMediumLow,
                'Bajo', COLORS.riskLow,
                '#888888'
              ],
              'circle-opacity': 0.85,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff'
            }
          });

          map.current.addLayer({
            id: 'customer-labels',
            type: 'symbol',
            source: 'customers',
            minzoom: 6,
            layout: {
              'text-field': ['get', 'name'],
              'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
              'text-radial-offset': 1.5,
              'text-justify': 'auto',
              'text-size': 11,
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
            },
            paint: {
                'text-color': '#141414',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2
            }
          });

          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'cashport-popup',
            offset: 15,
            maxWidth: '240px'
          });

          map.current.on('click', 'customer-circles', (e) => {
             if (!map.current) return;
             if (e.features && e.features[0]) {
                 const coordinates = (e.features[0].geometry as any).coordinates.slice();
                 const { name, risk, formattedPortfolio } = e.features[0].properties as any;
                 
                 const description = `
                    <div class="p-3 min-w-[140px]">
                        <h3 class="font-bold text-[#141414] text-sm mb-2 border-b border-gray-100 pb-1">${name}</h3>
                        <div class="space-y-1.5">
                             <div class="text-xs flex justify-between items-center">
                                <span class="text-gray-500 font-medium">Cartera</span>
                                <span class="font-bold text-[#141414]">${formattedPortfolio}</span>
                            </div>
                            <div class="text-xs flex justify-between items-center">
                                <span class="text-gray-500 font-medium">Riesgo</span>
                                <span class="font-bold px-1.5 py-0.5 rounded text-[10px] text-white" style="background-color: ${
                                    risk === 'Alto' ? COLORS.riskHigh : 
                                    risk === 'Medio alto' ? COLORS.riskMediumHigh : 
                                    risk === 'Medio' ? COLORS.riskMedium : 
                                    risk === 'Medio bajo' ? COLORS.riskMediumLow :
                                    COLORS.riskLow
                                }">${risk}</span>
                            </div>
                        </div>
                    </div>
                `;
                popup.setLngLat(coordinates).setHTML(description).addTo(map.current);
             }
          });

          map.current.on('mouseenter', 'customer-circles', () => {
             if (map.current) map.current.getCanvas().style.cursor = 'pointer';
          });
          map.current.on('mouseleave', 'customer-circles', () => {
             if (map.current) map.current.getCanvas().style.cursor = '';
          });
        });
    } catch (err) {
        console.error("Failed to initialize map:", err);
        setError("Error initializing map.");
    }

    return () => {
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
    };
  }, []);

  return (
    <div 
        className={`w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative animate-fade-in bg-gray-100 transition-all duration-300 ${
            isFullScreen ? 'fixed inset-0 z-50 h-screen rounded-none' : 'h-[calc(100vh-180px)] md:h-[calc(100vh-140px)]'
        }`}
    >
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
            <div className="text-center p-6 max-w-md">
                <p className="text-red-500 font-bold mb-2">Error</p>
                <p className="text-gray-600 text-sm">{error}</p>
            </div>
        </div>
      )}
      
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Expand/Collapse Button */}
      <button 
        onClick={() => setIsFullScreen(!isFullScreen)}
        className="absolute top-4 right-4 z-20 bg-white p-2 rounded-lg shadow-md text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
        title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {/* Legend Overlay */}
      <div className={`absolute left-4 bg-white/95 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg border border-gray-200 z-10 w-36 md:w-44 transition-all ${
        isFullScreen ? 'bottom-8 left-8' : 'bottom-4 md:bottom-6 md:left-6'
      }`}>
         <h4 className="text-[10px] md:text-xs font-bold text-[#141414] mb-2 md:mb-3 uppercase tracking-wide">Nivel de Riesgo</h4>
         <div className="space-y-2">
             {[
                { label: 'Alto', color: COLORS.riskHigh },
                { label: 'Medio Alto', color: COLORS.riskMediumHigh },
                { label: 'Medio', color: COLORS.riskMedium },
                { label: 'Medio Bajo', color: COLORS.riskMediumLow },
                { label: 'Bajo', color: COLORS.riskLow },
             ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                    <span className="text-[10px] md:text-[11px] font-medium text-gray-600">{item.label}</span>
                    <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-sm" style={{backgroundColor: item.color}}></span>
                </div>
             ))}
         </div>
      </div>
    </div>
  );
};

export default DashboardMap;