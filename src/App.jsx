import { useState, useEffect, useCallback } from 'react';
import CameraMap from './components/CameraMap';
import CameraList from './components/CameraList';
import Lightbox from './components/Lightbox';
import { fetchCameras } from './api/chmi';
import './App.css';

function App() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [loading, setLoading] = useState(true);
  const [flyToCamera, setFlyToCamera] = useState(false);
  const [lightboxCamera, setLightboxCamera] = useState(null); // Lifted from CameraMap

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchCameras();
      setCameras(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Called when selecting from the list (should fly to camera)
  const handleCameraSelectFromList = useCallback((camera) => {
    setSelectedCamera(camera);
    setFlyToCamera(true);
    if (window.innerWidth < 768) {
      setViewMode('map');
    }
  }, []);

  // Called when opening lightbox from map (should NOT fly, just open detail)
  const handleLightboxOpen = useCallback((camera) => {
    setLightboxCamera(camera);
    // Optionally sync selectedCamera without flying
    // setSelectedCamera(camera);
    // setFlyToCamera(false);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setLightboxCamera(null);
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ČHMÚ Kamery</h1>
        <div className="view-toggle">
          <button
            className={viewMode === 'map' ? 'active' : ''}
            onClick={() => setViewMode('map')}
          >
            Mapa
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            Seznam
          </button>
        </div>
      </header>

      <main className="app-content">
        {loading ? (
          <div className="loading">Načítám kamery...</div>
        ) : (
          <>
            <div className={`map-pane ${viewMode === 'map' ? 'visible' : 'hidden'}`}>
              <CameraMap
                cameras={cameras}
                selectedCamera={selectedCamera}
                flyToCamera={flyToCamera}
                onCameraSelect={setSelectedCamera}
                onLightboxOpen={handleLightboxOpen}
              />
            </div>
            <div className={`list-pane ${viewMode === 'list' ? 'visible' : 'hidden'}`}>
              <CameraList
                cameras={cameras}
                onSelect={handleCameraSelectFromList}
                selectedCamera={selectedCamera}
              />
            </div>
          </>
        )}
      </main>

      {/* Lightbox rendered at App level - outside CameraMap to prevent map re-renders */}
      {lightboxCamera && (
        <Lightbox
          camera={lightboxCamera}
          onClose={handleLightboxClose}
        />
      )}
    </div>
  );
}

export default App;
