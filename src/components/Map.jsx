import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvent,
} from "react-leaflet";
import styles from "./Map.module.css";
import { useEffect, useState } from "react";
import { useCities } from "../contexts/CitiesProvider";
import { useGeolocation } from "../Hooks/useGeolocation";
import Button from "./Button";
import { useUrlPosition } from "../Hooks/useUrlPosition";

function Map() {
  const { cities } = useCities();
  const {
    isLoading: isLoadingPostion,
    position: geoPosition,
    getPosition,
  } = useGeolocation();
  // const navigate = useNavigate();
  // console.log(cities);
  const [mapContainer, setMapContainer] = useState([40, 0]);
  const [maplat, maplng] = useUrlPosition();

  useEffect(() => {
    if (maplat && maplng) setMapContainer([maplat, maplng]);
  }, [maplat, maplng]);

  useEffect(() => {
    if (geoPosition) setMapContainer([geoPosition.lat, geoPosition.lng]);
  }, [geoPosition]);

  return (
    <>
      <div className={styles.mapContainer}>
        {!geoPosition && (
          <Button type="position" onClick={() => getPosition()}>
            {isLoadingPostion ? "loading..." : "Get Your Position"}
          </Button>
        )}
        <MapContainer
          center={mapContainer}
          zoom={13}
          scrollWheelZoom={true}
          className={styles.map}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          {cities.map((city) => {
            <Marker
              position={[city.position.lat, city.position.lng]}
              key={city.id}
            >
              <Popup>
                {city.emoji}
                <br /> {city.name}
              </Popup>
            </Marker>;
          })}
          <ChangeCenter position={mapContainer} />
          <DetectClick />
        </MapContainer>
      </div>
      ;
    </>
  );
}

function ChangeCenter({ position }) {
  const map = useMap();
  map.setView(position);

  return null;
}

function DetectClick() {
  const navigate = useNavigate();
  useMapEvent({
    click: (e) => {
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
}

export default Map;
