import { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Shop Location: VMWJ+Q6 Peravoor, Kerala (DIGITAL LAND SURVEY)
const SHOP_LOCATION = [75.6805034, 11.8969854]; // [longitude, latitude]
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
  const [routeGeoJson, setRouteGeoJson] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const mapRef = useRef(null);

  const fetchRoute = useCallback(async (userLon, userLat) => {
    setStatusMsg('Drawing route...');
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${SHOP_LOCATION[0]},${SHOP_LOCATION[1]}?overview=full&geometries=geojson`
      );
      const data = await res.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        setDistanceInfo({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60)
        });

        const geojson = {
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: route.geometry }]
        };
        
        setRouteGeoJson(geojson);
        setStatusMsg('');

        // Fit map to show full route
        if (mapRef.current) {
          const lons = [userLon, SHOP_LOCATION[0]];
          const lats = [userLat, SHOP_LOCATION[1]];
          mapRef.current.fitBounds(
            [[Math.min(...lons) - 0.05, Math.min(...lats) - 0.05],
             [Math.max(...lons) + 0.05, Math.max(...lats) + 0.05]],
            { padding: 40, duration: 1000 }
          );
        }
      } else {
        setErrorMsg('Could not calculate a route.');
        setStatusMsg('');
      }
    } catch (err) {
      console.error('Routing error:', err);
      setErrorMsg('Failed to fetch route. Please try again.');
      setStatusMsg('');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback((isAuto = false) => {
    if (!isAuto) { setLoading(true); setErrorMsg(''); }
    setStatusMsg('Locating you...');

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setLoading(false); setStatusMsg('');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
        fetchRoute(pos.coords.longitude, pos.coords.latitude);
      },
      (err) => {
        console.error('Geolocation error:', err);
        if (!isAuto) {
          const msgs = {
            1: 'Location access denied. Please allow location in your browser.',
            2: 'Location unavailable. Check your device settings.',
            3: 'Location request timed out. Please try again.'
          };
          setErrorMsg(msgs[err.code] || 'Could not get location.');
        }
        setLoading(false); setStatusMsg('');
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  }, [fetchRoute]);

  // Auto-fetch on mount
  useEffect(() => { requestLocation(true); }, [requestLocation]);

  return (
    <div className="map-container">
      <div className="map-sidebar">
        <h3>Find Us</h3>
        <p>Get directions from your current location to our office.</p>

        <button className="map-action-btn" onClick={() => requestLocation(false)} disabled={loading}>
          {loading ? 'Locating...' : (distanceInfo ? 'Refresh Route' : 'Get Directions')}{' '}
          <span>{loading ? '◌' : '⌖'}</span>
        </button>

        <a className="map-action-btn map-google-btn" href={GOOGLE_MAPS_DIRECTION_URL} target="_blank" rel="noreferrer">
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
          initialViewState={{ longitude: SHOP_LOCATION[0], latitude: SHOP_LOCATION[1], zoom: 14 }}
          mapStyle={roadMapStyle}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="bottom-right" />

          {/* Route Line Layers */}
          {routeGeoJson && (
            <Source id="route-source" type="geojson" data={routeGeoJson}>
              <Layer
                id="route-outline-layer"
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{ 'line-color': '#1a3a8a', 'line-width': 10, 'line-opacity': 0.4 }}
              />
              <Layer
                id="route-main-layer"
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{ 'line-color': '#4285F4', 'line-width': 5, 'line-opacity': 0.9 }}
              />
            </Source>
          )}

          {/* User Marker */}
          {userLocation && (
            <Marker longitude={userLocation[0]} latitude={userLocation[1]} anchor="center">
              <div className="user-marker-dot">
                <div className="user-marker-pulse" />
              </div>
            </Marker>
          )}

          {/* Shop Marker with Logo + Name */}
          <Marker longitude={SHOP_LOCATION[0]} latitude={SHOP_LOCATION[1]} anchor="bottom">
            <ShopMarker />
          </Marker>

        </Map>
      </div>
    </div>
  );
}
