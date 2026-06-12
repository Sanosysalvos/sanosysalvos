"use client";

import { useEffect, useRef, useCallback } from "react";

interface MapSelectorProps {
  latitud: number;
  longitud: number;
  onLocationChange: (lat: number, lng: number, direccion: string) => void;
  height?: string;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es`,
      {
        headers: {
          "User-Agent": "SanosYSalvos/1.0 (contacto@sanosysalvos.cl)",
        },
      }
    );
    if (!res.ok) return "";
    const data = await res.json();
    // Construimos una dirección legible priorizando los campos más útiles
    const { road, house_number, suburb, city, town, village, state } =
      data.address || {};
    const calle = road
      ? `${road}${house_number ? " " + house_number : ""}`
      : null;
    const sector = suburb || village || town || city || state || null;
    if (calle && sector) return `${calle}, ${sector}`;
    if (calle) return calle;
    if (sector) return sector;
    return data.display_name || "";
  } catch {
    return "";
  }
}

export default function MapSelector({
  latitud,
  longitud,
  onLocationChange,
  height = "300px",
}: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  // Ref para evitar llamadas duplicadas a reverse geocode
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMarkerMove = useCallback(
    async (lat: number, lng: number) => {
      // Debounce: esperar 600ms antes de llamar a Nominatim
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
      geocodeTimeoutRef.current = setTimeout(async () => {
        const direccion = await reverseGeocode(lat, lng);
        onLocationChange(lat, lng, direccion);
      }, 600);
    },
    [onLocationChange]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Corregir íconos de Leaflet en Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Evitar doble inicialización
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!).setView([latitud, longitud], 15);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Ícono personalizado rojo para el pin de selección
      const iconoPin = L.divIcon({
        className: "",
        html: `
          <div style="
            position:relative;
            width:32px;
            height:44px;
            display:flex;
            flex-direction:column;
            align-items:center;
          ">
            <div style="
              width:32px;
              height:32px;
              border-radius:50% 50% 50% 0;
              background:#6366f1;
              border:3px solid #fff;
              transform:rotate(-45deg);
              box-shadow:0 3px 10px rgba(0,0,0,0.35);
            "></div>
            <div style="
              width:6px;
              height:10px;
              background:#6366f1;
              border-radius:0 0 3px 3px;
              margin-top:-2px;
            "></div>
          </div>
        `,
        iconSize: [32, 44],
        iconAnchor: [16, 44],
        popupAnchor: [0, -44],
      });

      // Marcador arrastrable
      const marker = L.marker([latitud, longitud], {
        icon: iconoPin,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      // Llamada inicial de geocoding para mostrar la dirección de la posición por defecto
      handleMarkerMove(latitud, longitud);

      // Evento al soltar el marcador después de arrastrarlo
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        handleMarkerMove(pos.lat, pos.lng);
      });

      // Click en el mapa mueve el marcador
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handleMarkerMove(lat, lng);
      });
    };

    initMap();

    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // Solo inicializamos una vez — latitud/longitud son el centro inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: "100%",
        borderRadius: "0.75rem",
        zIndex: 0,
        border: "1px solid #e2e8f0",
      }}
    />
  );
}