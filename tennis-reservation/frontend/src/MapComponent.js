import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '60vh'
};

const center = {
  lat: 33.259654,  // Replace with your location's latitude
  lng: 35.769403   // Replace with your location's longitude
};

const options = {
  disableDefaultUI: true, // Disables all default UI controls
  zoomControl: true, // Optionally enable zoom control
  streetViewControl: false, // Disable street view control
  mapTypeControl: false, // Disable map type control (e.g., satellite)
  fullscreenControl: false, // Disable fullscreen control
  gestureHandling: 'greedy' // Prevent map from scrolling or zooming by accident
};

const MapComponent = () => {
  const handleMarkerClick = () => {
    const destination = `${center.lat},${center.lng}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    const wazeUrl = `https://waze.com/ul?ll=${center.lat},${center.lng}&navigate=yes`;

    // Open the user's choice of app in a new tab
    if (window.confirm("Would you like to use Google Maps for directions?")) {
      window.open(googleMapsUrl, '_blank');
    } else {
      window.open(wazeUrl, '_blank');
    }
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyAC8MxvkSpTzAojjdk9FuCMUut9y2dfX5o">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={options} // Apply the options here
        onClick={handleMarkerClick} // Handle clicks on the map
        
      >
        <Marker
          position={center}
          onClick={handleMarkerClick} // When the marker is clicked, open directions
        />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
