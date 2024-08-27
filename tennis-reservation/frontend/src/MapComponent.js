import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '60vh'
};

const center = {
  lat: 33.260420,  // Replace with your location's latitude
  lng: 35.770795   // Replace with your location's longitude
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
