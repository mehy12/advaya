"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Location {
  lat: number;
  lng: number;
}

interface Props {
  value: Location | null;
  onChange: (location: Location) => void;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function ClickHandler({ onChange }: { onChange: (location: Location) => void }) {
  useMapEvents({
    click: (event) => {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

export default function LocationPickerMap({ value, onChange }: Props) {
  const center: [number, number] = value ? [value.lat, value.lng] : [18.975, 72.8258];

  return (
    <MapContainer
      center={center}
      zoom={value ? 10 : 4}
      style={{ height: "240px", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      {value && <Marker position={[value.lat, value.lng]} />}
    </MapContainer>
  );
}
