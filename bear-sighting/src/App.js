
import './App.css';
import React from 'react';
import {
  GoogleMap, 
  useLoadScript,
  Marker,
  InfroWindow,
} from '@react-google-maps/api';
import { formRelative } from 'date-fns';

import '@reach/combobox/styles.css';
import mapStyles from './mapStyles';

const libraries = ['places'];
const mapContainerStyle= {
  widht: "100w",
  height: "100vh",
};
const center = {
  lat: 43.653225,
  lng: -79.383186,

}

const options = {
  styles:mapStyles,
  disableDefaultUI: true,
  zoomControl: true,


}

export default function App() {
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [ markers, setMarkers] = React.useState([]);

  ///Create  a new hook call callback //////
  //// This allows you to call a function that has the same value unless the depths change  
  const onMapClick = React.useCallback((event) =>{
    setMarkers((current) => [
      ...current,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
      },
    ])
  }, [])

  //Add another variable

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  ///Create some if statements if there was an load error////
  if (loadError) return 'Error loading Maps';
  if(!isLoaded) return 'Loading Maps';

  return (
    <div>
      <h1>Bears</h1>
  <GoogleMap
  mapContainerStyle= {mapContainerStyle}
  zoom={8}
  center={center}
  options={options}
    onClick={onMapClick}
    onLoad= {onMapLoad}
  >
    {markers.map(marker => <Marker key={marker.time.toISOString()}
    position= {{lat: marker.lat, lng: marker.lng}} />)}
    icon= {{
      url:"./bear.svg",
      scaledSize: new window.google.maps.Size(30,30),
      origin: new window.google.maps.Points(0,0),
      anchor: new window.google.mpas.Points(15, 15),
    }}
  </GoogleMap>
  </div>
  )
};
