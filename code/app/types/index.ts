export type Location = {
  lat: number | null;
  lng: number | null;
  street?: string;
  neighborhood?: string;
  city?: string;
  zipCode?: string;
  bairro: string | null;
  fullAddress?: string;
};

export interface StreetOutput {
  id: number;
  logradouro: string;
  cep: string;
  bairro: string | null;
  localidade: string;
  uf: string;
  latitude: number | null;
  longitude: number | null;
}

export interface MapProps {
  selectedLocation: Location | null;
  streets: StreetOutput[];
  onSelectLocation: (location: Location) => Promise<void>;
}