import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import 'leaflet.heat';
import { hexbin } from 'd3-hexbin';
import { scaleLinear } from 'd3-scale';
import Header from './Header';

function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function HexbinLayer({ points }) {
  const map = useMap();
  const [bins, setBins] = useState([]);

  useEffect(() => {
    if (!map || !points.length) return;

    const baseZoom = 12; // wielkosc hexagonu zalezy od zoomu mapy
    const hexRadius = 30; // promien hexagonu
    const hexGap = 1.1; 

    //  przeksztalecenie wspolrzednych na tablice punktow
    const projectedPoints = points.map(p => {
      const point = map.project([p.latitude, p.longitude], baseZoom);
      return [point.x, point.y];
    });

    //  tworzenie hexagonow
    const hexbinGenerator = hexbin()
      .radius(hexRadius);

    const generatedBins = hexbinGenerator(projectedPoints);

    // rysowanie wielokatow  dla kazdego hexagonu
    const polygons = generatedBins.map(bin => {
      const corners = [];
      for (let i = 0; i < 6; i++) {
        //wzor na wierzcholek 
        const angle = 2 * Math.PI / 6 * i - Math.PI / 6;
        // x i y wierzcholka
        const x = bin.x + (hexRadius - hexGap) * Math.cos(angle);
        const y = bin.y + (hexRadius - hexGap) * Math.sin(angle);
        // tlumaczy spowrotem na wspolrzedne
        const latLng = map.unproject([x, y], baseZoom);
        corners.push([latLng.lat, latLng.lng]);
      }
      
      return {
        positions: corners,
        count: bin.length
      };
    });

    setBins(polygons);
  }, [map, points]); 

  // statystyki
  const counts = bins.map(b => b.count);
  const maxCount = Math.max(...counts, 0);
  const totalCount = counts.reduce((a, b) => a + b, 0);
  const averageCount = counts.length > 0 ? totalCount / counts.length : 0;

  const threshold = averageCount * 1.3;

  const visibleBins = bins.filter(b => b.count > threshold);

  //kolorowanie
  const colorScale = scaleLinear()
    .domain([threshold, maxCount])
    .range(['#facc15', '#ef4444']);

  return (
    <>
      {visibleBins.map((bin, i) => (
        <Polygon
          key={i}
          positions={bin.positions}
          pathOptions={{
            fillColor: colorScale(bin.count),
            fillOpacity: 0.6,
            color: 'white',
            weight: 1,
            opacity: 0.5
          }}
        >
          <Popup>
            <div className="text-slate-900">
              <span className="font-bold">Liczba odbiorów: {bin.count}</span>
              <br />
              <span className="text-xs text-slate-500">
                Wymagany próg: {threshold.toFixed(1)}
              </span>
            </div>
          </Popup>
        </Polygon>
      ))}
    </>
  );
}

function DriverMap({ user, onLogout, navigateTo }) {
  const defaultPosition = [50.8118, 19.1203];

  const [currentPosition, setCurrentPosition] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [pickupData, setPickupData] = useState([]);
  
  const [viewMode, setViewMode] = useState('recommendation'); 

  useEffect(() => {
    const fetchPickupData = async () => {
      try {
        let url = '/api/pickups';
        if (viewMode === 'recommendation') {
          const now = new Date();
          const day = now.getDay();
          const hour = now.getHours();
          url = `/api/pickups/recommendations?day=${day}&hour=${hour}`;
        }

        const response = await fetch(url, {
          headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`,}
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Blad podczas pobierania danych o odbiorach: ${response.status}`);
        }

        const data = await response.json();
        setPickupData(data);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    };
    fetchPickupData();
  }, [viewMode, user.id]);

  const handleLogPickup = () => {
    setIsLoading(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition([latitude, longitude]);

        try {
          const response = await fetch('/api/pickups', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              userId: user.id,
              latitude,
              longitude,
            }),
          });

          if (!response.ok) {
            throw new Error('Nie udalo sie zapisac lokalizacji');
          }

          setMessage({ type: 'success', text: 'Lokalizacja zapisana pomyslnie!' });
          
          const refreshUrl = viewMode === 'recommendation' 
            ? `/api/pickups/recommendations?day=${new Date().getDay()}&hour=${new Date().getHours()}`
            : '/api/pickups';
            
          const refreshRes = await fetch(refreshUrl, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
          if(refreshRes.ok) {
             const newData = await refreshRes.json();
             setPickupData(newData);
          }

        } catch (err) {
          setMessage({ type: 'error', text: err.message });
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setIsLoading(false);
        setMessage({ type: 'error', text: 'Nie udalo sie pobrac lokalizacji' });
      }
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} onLogout={onLogout} navigateTo={navigateTo} currentPage="driverMap" />
      
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Mapa Odbiorów
          </h1>
    
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 p-4 border rounded-xl bg-slate-800/50 border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('history')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewMode === 'history'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Historia
                </button>
                <button
                  onClick={() => setViewMode('recommendation')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewMode === 'recommendation'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Rekomendacje
                </button>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-400">
                <span className="font-medium">ID: {user?.id || 'Brak'}</span>
              </div>
            </div>

            {viewMode === 'recommendation' && (
              <div className="flex items-center gap-4 pt-4 mt-2 border-t border-slate-700">
                <div className="text-sm text-slate-300">
                  <span className="text-slate-400">Aktualna rekomendacja: </span>
                  <span className="font-semibold text-white">
                    {['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'][new Date().getDay()]}, 
                    {' '}{new Date().getHours()}:00
                  </span>
                </div>
                <div className="ml-auto text-xs text-slate-500">
                  Analiza historyczna dla obecnej godziny (+/- 1h)
                </div>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
                message.type === 'error'
                  ? 'border-red-500/50 bg-red-500/10 text-red-300'
                  : 'border-green-500/50 bg-green-500/10 text-green-300'
              }`}
            >
              <svg
                className={`h-5 w-5 flex-shrink-0 ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                {message.type === 'error' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden border shadow-2xl rounded-xl border-slate-700 bg-slate-800/30">
          <div className="h-[calc(100vh-20rem)] min-h-[400px] sm:h-[600px]">
            <MapContainer
              center={defaultPosition}
              zoom={10}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {pickupData.length > 0 && (
                viewMode === 'recommendation' ? (
                  <HexbinLayer points={pickupData} />
                ) : (
                  <Heatmap points={pickupData} />
                )
              )}

              {currentPosition && (
                <Marker position={currentPosition}>
                  <Popup>Twoja aktualna lokalizacja</Popup>
                </Marker>
              )}

              {currentPosition && <ChangeMapView center={currentPosition} />}
            </MapContainer>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-[1000] flex justify-center pb-16 sm:pb-20">
            <button
              onClick={handleLogPickup}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 rounded-full shadow-2xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/50 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:from-green-600 disabled:hover:to-green-700 disabled:hover:scale-100 sm:text-lg"
            >
              {isLoading ? (
                <>
                  <svg className="w-6 h-6 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Pobieranie lokalizacji...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Odbieram klienta
                </>
              )}
            </button>
          </div>

          <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Łączna liczba odbiorów: {pickupData.length}</span>
              {currentPosition && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Lokalizacja aktywna
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverMap;

function Heatmap({ points }) {
  const map = useMap();
  React.useEffect(() => {
    if (!map || !points?.length) return;
    const latlngs = points.map((p) => [p.latitude, p.longitude, 1]);
    const heat = (window.L || globalThis.L).heatLayer(latlngs, {
      radius: 20,
      blur: 15,
      maxZoom: 18,
    }).addTo(map);
    return () => {
      heat.remove();
    };
  }, [map, points]);
  return null;
}
