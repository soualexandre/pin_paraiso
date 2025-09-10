export type Location = {
  lat: number;
  lng: number;
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
  latitude: number;
  longitude: number;
}

export interface MapProps {
  selectedLocation: Location | null;
  streets: StreetOutput[];
  onSelectLocation: (location: Location) => Promise<void>;
}