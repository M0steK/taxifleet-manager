import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';

function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}
function DriverMap({ user, navigateBack }) {
  const defaultPosition = [52.23, 21.01]; // Warszawa

  const [currentPosition, setCurrentPosition] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [pickupData, setPickupData] = useState([]);

  useEffect(() => {
    const fetchPickupData = async () => {
      try {
        const response = await fetch('/api/pickups');

        if (!response.ok) {
          throw new Error('Blad podczas pobierania danych o odbiorach');
        }

        const data = await response.json();
        setPickupData(data);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    };
    fetchPickupData();
  }, []);

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              latitude,
              longitude,
              pickupTimestamp: new Date().toISOString(),
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Nie udalo sie pobrać lokalizacji');
          }

          const newPickupPoint = await response.json();

          setPickupData((currentPickups) => [...currentPickups, newPickupPoint]);
          setMessage({
            type: 'success',
            text: 'Pomyślnie dokonano odbioru!',
          });
        } catch (err) {
          setMessage({ type: 'error', text: err.message });
        } finally {
          setIsLoading(false);
        }
      },

      (error) => {
        console.error('Geolocation error: ', error);
        setMessage({
          type: 'error',
          text: 'Nie można pobrać lokalizacji, czy zezwoliłeś na dostęp?',
        });
        setIsLoading(false);
      }
    );
  };
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
          Mapa i Heatmapa Odbiorów
        </h1>
        <button
          onClick={navigateBack}
          className="rounded-md bg-slate-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
        >
          Powrót do Panelu Głównego
        </button>
      </header>
      <main>
        <div className="sm: mb-4 flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={handleLogPickup}
            disabled={isLoading}
            className="rounded-md bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm transition duration-150 hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Pobieranie Lokalizacji...' : 'Odbieram klienta'}
          </button>

          {message && (
            <p
              className={`font-medium ${
                message.type === 'error' ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
        <div className="h-[70vh] w-full rounded-lg shadow-md" style={{ height: '70vh' }}>
          <MapContainer
            center={defaultPosition}
            zoom={10}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {pickupData.length > 0 && (
              <HeatmapLayer
                points={pickupData}
                longitudeExtractor={(point) => point.longitude}
                latitudeExtractor={(point) => point.latitude}
                intensityExtractor={() => 1}
                radius={20}
                blur={15}
                maxZoom={18}
              />
            )}

            {currentPosition && (
              <Marker position={currentPosition}>
                <Popup>Twoja lokalizacja</Popup>
              </Marker>
            )}

            {currentPosition && <ChangeMapView center={currentPosition} />}
          </MapContainer>
        </div>

        <p className="mt-4 text-slate-500">ID zalogowanego kierowcy: {user ? user.id : 'Brak'}</p>
      </main>
    </div>
  );
}

export default DriverMap;
