"use client";
import { useEffect, useRef, useState } from "react";
import { Location, MapProps } from "../types";

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function StreetMap({
  selectedLocation,
  streets,
  onSelectLocation,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );

  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
    } else {
      loadScript();
    }

    function loadScript() {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }

    function initMap() {
      if (!mapRef.current) return;
      const initialLocation = selectedLocation || {
        lat: -10.1722,
        lng: -48.881,
        bairro: null,
      };

      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: initialLocation,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      const info = new window.google.maps.InfoWindow();
      setInfoWindow(info);

      // Clique no mapa
      googleMap.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: e.latLng }, (results, status) => {
          const address: Location = {
            lat,
            lng,
            bairro: null,
          };

          if (status === "OK" && results && results[0]) {
            results[0].address_components.forEach(
              (comp: google.maps.GeocoderAddressComponent) => {
                const types = comp.types;

                if (types.includes("route")) address.street = comp.long_name;
                else if (
                  types.includes("sublocality") ||
                  types.includes("neighborhood")
                )
                  address.bairro = comp.long_name;
                else if (types.includes("administrative_area_level_2"))
                  address.city = comp.long_name;
                else if (types.includes("postal_code"))
                  address.zipCode = comp.long_name;
              }
            );

            address.fullAddress = results[0].formatted_address;
          }

          onSelectLocation(address);
          addMarker(address, true);
        });
      });

      setMap(googleMap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;

    markers.forEach((m) => m.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    streets.forEach((street) => {
      if (!street.latitude || !street.longitude) return;

      const marker = new window.google.maps.Marker({
        position: { lat: street.latitude, lng: street.longitude },
        map,
        title: street.logradouro,
        icon: { url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" },
      });

      marker.addListener("click", () => {
        if (!infoWindow) return;

        const address: Location = {
          lat: street.latitude!,
          lng: street.longitude!,
          street: street.logradouro,
          bairro: street.bairro,
          city: street.localidade,
          zipCode: street.cep,
        };

        onSelectLocation(address);

        infoWindow.setContent(`
          <div>
            <strong>${street.logradouro}</strong><br/>
            ${street.bairro || ""}<br/>
            ${street.localidade || ""}<br/>
            CEP: ${street.cep || ""}
          </div>
        `);
        infoWindow.open(map, marker);
        map.panTo(marker.getPosition()!);
        map.setZoom(17);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [streets, map, infoWindow, onSelectLocation]);

  const addMarker = (address: Location, selected = false) => {
    if (!map) return;
    markers.forEach((m) => m.setMap(null));

    const marker = new window.google.maps.Marker({
      position: { lat: address.lat, lng: address.lng },
      map,
      title: address.street || "Local selecionado",
      icon: {
        url: selected
          ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
    });

    if (infoWindow) {
      infoWindow.setContent(`
        <div>
          <strong>${address.street || "Local selecionado"}</strong><br/>
          ${address.bairro || ""}<br/>
          ${address.city || ""}<br/>
          CEP: ${address.zipCode || ""}<br/>
          Coordenadas: ${address?.lat?.toFixed(6)}, ${address?.lng?.toFixed(6)}
        </div>
      `);
      infoWindow.open(map, marker);
    }

    setMarkers([marker]);
  };

  return <div ref={mapRef} className="w-full h-full rounded-lg shadow-md" />;
}
