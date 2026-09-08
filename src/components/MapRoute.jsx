import { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Shop Location: VMWJ+Q6 Peravoor, Kerala (DIGITAL LAND SURVEY)
// Format: [longitude, latitude]
const SHOP_LOCATION = [75.6805034, 11.8969854]; // Peravoor, Kannur, Kerala
const GOOGLE_MAPS_DIRECTION_URL = 'https://www.google.com/maps/dir/?api=1&destination=11.8969854,75.6805034';

const roadMapStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

// Custom shop marker with logo and name
function ShopMarker() {
  return (
    <div className="shop-marker">
      <div className="shop-marker-bubble">
        <img src="/favicon.svg" alt="Truepoint Logo" className="shop-marker-logo" />
        <span className="shop-marker-name">Truepoint</span>
      </div>
      <div className="shop-marker-arrow" />
    </div>
  );
}

export default function MapRoute() {
  const [userLocation, setUserLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const mapRef = useRef(null);

  const fetchRoute = useCallback(async (userLon, userLat) => {
    setStatusMsg('Drawing route...');
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${SHOP_LOCATION[0]},${SHOP_LOCATION[1]}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);
        
        setDistanceInfo({ distance: distanceKm, duration: durationMin });
        
        const geojson = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          ]
        };
        
        setRouteData(geojson);
        setStatusMsg('');
        
        // Fit bounds to show the whole route
        if (mapRef.current) {
          const lons = [userLon, SHOP_LOCATION[0]];
          const lats = [userLat, SHOP_LOCATION[1]];
          const bounds = [
            [Math.min(...lons) - 0.05, Math.min(...lats) - 0.05],
            [Math.max(...lons) + 0.05, Math.max(...lats) + 0.05]
          ];
          mapRef.current.fitBounds(bounds, { padding: 40, duration: 1000 });
        }
      } else {
        setErrorMsg('Could not calculate a route.');
        setStatusMsg('');
      }
    } catch (err) {
      console.error("Routing error:", err);
      setErrorMsg('Failed to fetch route. Please try again.');
      setStatusMsg('');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback((isAuto = false) => {
    if (!isAuto) {
      setLoading(true);
      setErrorMsg('');
    }
    setStatusMsg('Locating you...');

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setLoading(false);
      setStatusMsg('');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLon = position.coords.longitude;
        const userLat = position.coords.latitude;
        setUserLocation([userLon, userLat]);
        fetchRoute(userLon, userLat);
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (!isAuto) {
          if (error.code === 1) {
            setErrorMsg('Location access denied. Please allow location access in your browser and try again.');
          } else if (error.code === 2) {
            setErrorMsg('Location unavailable. Please check your device settings.');
          } else {
            setErrorMsg('Location request timed out. Please try again.');
          }
        }
        setLoading(false);
        setStatusMsg('');
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  }, [fetchRoute]);

  // Auto-fetch route on mount
  useEffect(() => {
    requestLocation(true);
  }, [requestLocation]);

  return (
    <div className="map-container">
      <div className="map-sidebar">
        <h3>Find Us</h3>
        <p>Get directions from your current location to our office.</p>
        
        <button 
          className="map-action-btn" 
          onClick={() => requestLocation(false)} 
          disabled={loading}
        >
          {loading ? 'Locating...' : (distanceInfo ? 'Refresh Route' : 'Get Directions')} <span>{loading ? '◌' : '⌖'}</span>
        </button>
        
        <a 
          className="map-action-btn map-google-btn" 
          href={GOOGLE_MAPS_DIRECTION_URL} 
          target="_blank" 
          rel="noreferrer"
        >
          Open in Google Maps <span>↗</span>
        </a>
        
        {statusMsg && <p className="map-status">{statusMsg}</p>}
        {errorMsg && <p className="map-error">{errorMsg}</p>}
        
        {distanceInfo && (
          <div className="route-info">
            <div className="info-item">
              <small>DISTANCE</small>
              <strong>{distanceInfo.distance} km</strong>
            </div>
            <div className="info-item">
              <small>EST. TIME</small>
              <strong>{distanceInfo.duration} min</strong>
            </div>
          </div>
        )}
      </div>
      
      <div className="map-wrapper">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: SHOP_LOCATION[0],
            latitude: SHOP_LOCATION[1],
            zoom: 14
          }}
          mapStyle={roadMapStyle}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="bottom-right" />
          
          {/* Shop Marker with Logo + Name */}
          <Marker 
            longitude={SHOP_LOCATION[0]} 
            latitude={SHOP_LOCATION[1]} 
            anchor="bottom"
          >
            <ShopMarker />
          </Marker>
          
          {/* User Marker */}
          {userLocation && (
            <Marker longitude={userLocation[0]} latitude={userLocation[1]} anchor="center">
              <div className="user-marker-dot">
                <div className="user-marker-pulse" />
              </div>
            </Marker>
          )}
          
          {/* Route Line */}
          {routeData && (
            <>
              <Source id="route-outline" type="geojson" data={routeData}>
                <Layer 
                  id="route-outline-line" 
                  type="line" 
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round'
                  }}
                  paint={{
                    'line-color': '#1a56db',
                    'line-width': 8,
                    'line-opacity': 0.4
                  }} 
                />
              </Source>
              <Source id="route" type="geojson" data={routeData}>
                <Layer 
                  id="route-line" 
                  type="line" 
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round'
                  }}
                  paint={{
                    'line-color': '#4285F4',
                    'line-width': 5,
                    'line-opacity': 0.9
                  }} 
                />
              </Source>
            </>
          )}
        </Map>
      </div>
    </div>
  );
}

