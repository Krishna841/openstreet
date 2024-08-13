import React from 'react';
import MapView from './components/map';
import './App.css';

function App() {
  const startCoords = { lat: 22.1696 , lng: 91.4996 };
  const endCoords = { lat: 22.2637, lng: 91.7159 };
  const speed = 20; // km/h

  return (
    <div>
      <div className='container'>
      <div className='info'>
        <div>
        <b>Starting</b>
        <div>
          Lat: {startCoords.lat} <br/> Lng: {startCoords.lng}
        </div>
        </div>
        <div className='speed'><b> Speed:</b> {speed} kmph</div>
        <div>
        <b>Ending</b>
        <div>
          Lat: {endCoords.lat} <br/> Lng: {endCoords.lng}
        </div>
        </div>
      </div>
      </div>
      <MapView startCoords={startCoords} endCoords={endCoords} speed={speed} />
    </div>
  );
}

export default App;
