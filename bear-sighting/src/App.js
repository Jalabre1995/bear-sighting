
import './App.css';
import React from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { formatRelative } from 'date-fns';
import usePlacesAutocomplete, {getGeocode,getLatLng,} from 'use-places-autocomplete';
import {Combobox,ComboboxInput,ComboboxPopover,ComboboxList,ComboboxOption} from '@reach/combobox';
import '@reach/combobox/styles.css';
import mapStyles from './mapStyles';

const libraries = ['places'];
const mapContainerStyle = {
  widht: "100w",
  height: "100vh",
};
const center = {
  lat: 43.653225,
  lng: -79.383186,

}

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,


}

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  ///Create  a new hook call callback //////
  //// This allows you to call a function that has the same value unless the depths change  
  const onMapClick = React.useCallback((event) => {
    setMarkers((current) => [
      ...current,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
      },
    ])
  }, [])

  //Add another varibale

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);
  const panTo = React.useCallback(({lat, lng}) => {
    ////Going to access the google Maps ref and we are going to pass panTo as a prop into the function  
    mapRef.current.panTo({lat, lng});
    mapRef.current.setZoom(14);
  }, []);

  ///Create some if statements if there was an load error////
  if (loadError) return 'Error loading Maps';
  if (!isLoaded) return 'Loading Maps';

  return (
    <div>
      <h1>
        Bears{''}
        <span role='img' aria-label='tent'>
          ⛺
        </span>
      </h1>
      <Search panTo ={panTo}/>
      <Locate panto= {panTo} />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {markers.map((marker =>
          <Marker
            key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => {
              setSelected(marker);
            }}
            icon={{
              url: "./bear.svg",
              scaledSize: new window.google.maps.Size(30, 30),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
            }}
          />
        ))}

        {selected ? (
          <InfoWindow
          ///This is going to pop up the white window and its goign to append a child, showing when the bear was spotted.
          ///I am also going to use the form relative where its going to take two dates and spit up a value that is related to now..
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>
                <span role='img' aria-label='bear'>
                  🐻
                </span>{''}
                    Alert
                  </h2>
              <p>Spotted {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

function Locate({panTo}){
  return(
  <button className = 'locate' onClick={() =>{
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
    }, () => null, options);
  }}><img src= "compass.svg" alt ='compass- locate me'/>
  </button>
  );
}

function Search({panTo}){
  ///This is where we are going to set up the autocomplete///
  ///So when it is searching its goign to prefer places that ar enear the user////
  const{ready, value,suggestions:{status, data}, setValue, clearSuggestions,} = usePlacesAutocomplete({
    requestOptions: {
      location: {lat: () => 43.653225, lng: () => -79.383186 },
      /// The span of the area will be 200km, but in the documentation it takes it by using meters. So we did 200 * 1000 to get 200,000km 
      radius: 200 + 1000,
    },
  });
////Here we are displaying the serach suggestions////
  return(
    ///Going to add a async to return a promise. The promise is going to wait until Geocode for the address is entered and return the lat and lng.
  <div class= 'search'>
   < Combobox onSelect={async(address) => {
     setValue(address,false);
     //When a user selects an address, we are going to call the setValue to be false.
     clearSuggestions()
     try{
       const results = await getGeocode({address});
       const{lat, lng} = await getLatLng(results[0]);
       panTo({lat,lng});
     }catch(error){
       console.log('error')
     }
    console.log(address);
  }}
  /////Inserting the Combobox Input, this is going to take in the vlaue in the Search function and its going to wait for the change of the event. 
  >
    <ComboboxInput value ={value} onChange={(e) =>{
      setValue(e.target.value);
      }}
      disabled = {!ready}
      placeholder= 'Enter an address'
      />
      <ComboboxPopover>
      <ComboboxList>
        {status === 'OK' &&
         data.map(({id, description}) =><ComboboxOption key={id} value={description} /> )}
         </ComboboxList>
      </ComboboxPopover>
  
  </Combobox>
  </div>
  );
}