"use client";

import { useEffect, useRef, useState } from "react";
import { StreetOutput } from "./types";
import { CEPService } from "./lib/services/cepService";

interface Location {
  city: string;
  street: string;
  zipCode: string;
  neighborhood: string;
  bairro?: string;
  lat?: number;
  lng?: number;
}

// Componente de Anúncio
const AdSenseSlot = ({ slot, className = "" }: { slot: string; className?: string }) => (
  <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}>
    <div className="text-center p-4">
      <div className="text-gray-400 text-sm font-medium mb-1">Google AdSense</div>
      <div className="text-gray-500 text-xs">Slot: {slot}</div>
      <div className="text-gray-400 text-xs mt-2">
        {/* Insira aqui o código do Google AdSense */}
        {/* <ins className="adsbygoogle" ... /> */}
      </div>
    </div>
  </div>
);

// Componente de Card
const StreetCard = ({ 
  street, 
  isSelected, 
  onClick,
  index 
}: { 
  street: StreetOutput; 
  isSelected: boolean; 
  onClick: () => void;
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [isSelected]);

  return (
    <div
      ref={cardRef}
      className={`
        flex-shrink-0 w-64 lg:w-72 
        ${isSelected 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-lg scale-[1.02]' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
        rounded-2xl border-2 p-4 cursor-pointer 
        transition-all duration-200 ease-out
        hover:scale-[1.02] active:scale-[0.98]
      `}
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      )}

      <div className="mb-3">
        <h4 className={`font-bold text-base leading-tight truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
          {street.logradouro}
        </h4>
        
        <div className="mt-1">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
            #{index + 1}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {street.bairro && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Bairro:</span>
            <span className={`text-sm truncate ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
              {street.bairro}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Cidade:</span>
          <span className={`text-sm truncate ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
            {street.localidade}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">CEP:</span>
          <span className={`text-sm font-mono font-medium ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
            {street.cep}
          </span>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <span className={`text-xs font-medium ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
          {isSelected ? '✓ Selecionado' : 'Clique para selecionar'}
        </span>
      </div>
    </div>
  );
};

// Componente Principal
export default function PinParaiso() {
  const [streets, setStreets] = useState<StreetOutput[]>([]);
  const [selectedStreet, setSelectedStreet] = useState<StreetOutput | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // Busca com debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setStreets([]);
        setTotalResults(0);
        return;
      }

      setIsLoading(true);
      
      try {
        const response = await CEPService.searchCEPs(searchTerm);
        console.log('Resposta da busca:', response);
        setStreets(response.results);
        setTotalResults(response.total);
        
        if (response.results.length > 0) {
          const firstResult = response.results[0];
          setSelectedStreet(firstResult);
          setSelectedLocation({
            city: firstResult.localidade,
            street: firstResult.logradouro,
            zipCode: firstResult.cep,
            neighborhood: firstResult.bairro || firstResult.uf,
            bairro: firstResult.bairro,
            lat: firstResult.latitude,
            lng: firstResult.longitude,
          });
        } else {
          setSelectedStreet(null);
          setSelectedLocation(null);
        }
      } catch (error) {
        console.error('Erro ao buscar:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (streets.length === 0) return;

      const currentIndex = selectedStreet 
        ? streets.findIndex(s => s.id === selectedStreet.id)
        : -1;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (currentIndex > 0) {
            const newStreet = streets[currentIndex - 1];
            setSelectedStreet(newStreet);
            updateSelectedLocation(newStreet);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentIndex < streets.length - 1) {
            const newStreet = streets[currentIndex + 1];
            setSelectedStreet(newStreet);
            updateSelectedLocation(newStreet);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [streets, selectedStreet]);

  const updateSelectedLocation = (street: StreetOutput) => {
    setSelectedLocation({
      city: street.localidade,
      street: street.logradouro,
      zipCode: street.cep,
      neighborhood: street.bairro || street.uf,
      bairro: street.bairro,
      lat: street.latitude,
      lng: street.longitude,
    });
  };

  const handleStreetClick = (street: StreetOutput) => {
    setSelectedStreet(street);
    updateSelectedLocation(street);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-96 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20">
        <div className="px-6 py-8 border-b border-gray-100/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            PinParaíso
          </h1>
          <p className="text-xs text-gray-500 font-medium">Explore endereços</p>
        </div>

        {/* ANÚNCIO 1 */}
        <div className="px-6 py-4 border-b border-gray-100/50">
          <AdSenseSlot slot="sidebar-top" className="h-24" />
        </div>

        {/* Busca */}
        <div className="px-6 py-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por rua, bairro ou CEP..."
              className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : streets.length > 0 ? (
            <>
              {totalResults > streets.length && (
                <div className="mb-3 text-xs text-gray-500 text-center bg-yellow-50 rounded-lg p-2">
                  Mostrando {streets.length} de {totalResults} resultados
                </div>
              )}
              <div className="space-y-3 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {streets.map((street) => (
                  <div
                    key={street.id}
                    onClick={() => handleStreetClick(street)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedStreet?.id === street.id
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-bold text-gray-900">{street.logradouro}</h4>
                    {street.bairro && <p className="text-sm text-gray-600">{street.bairro}</p>}
                    <p className="text-xs text-gray-500 font-mono">{street.cep}</p>
                  </div>
                ))}
              </div>
            </>
          ) : searchTerm.length >= 3 ? (
            <div className="text-center text-gray-500 py-8">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Digite pelo menos 3 caracteres para buscar
            </div>
          )}
        </div>

        {/* ANÚNCIO 2 */}
        <div className="px-6 py-4 border-t border-gray-100/50">
          <AdSenseSlot slot="sidebar-bottom" className="h-24" />
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile */}
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="p-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              PinParaíso
            </h1>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar endereço..."
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          {/* ANÚNCIO 3 */}
          <div className="px-4 pb-3">
            <AdSenseSlot slot="mobile-top" className="h-16" />
          </div>
        </div>

        {/* Mapa */}
        <div className="flex-1 relative bg-gray-200">
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center p-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-lg font-medium">Mapa será exibido aqui</p>
              <p className="text-sm mt-2">Integre com Leaflet ou Google Maps</p>
              {selectedLocation && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-lg max-w-sm mx-auto">
                  <p className="font-bold">{selectedLocation.street}</p>
                  <p className="text-sm text-gray-600">{selectedLocation.neighborhood}</p>
                  <p className="text-xs text-gray-500">{selectedLocation.zipCode}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista Horizontal */}
        {streets.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:left-8 lg:right-8 z-20">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {streets.length} endereço{streets.length > 1 ? 's' : ''} encontrado{streets.length > 1 ? 's' : ''}
              </h3>
              
              {streets.length > 1 && selectedStreet && (
                <div className="text-xs text-gray-500 bg-white/80 rounded-full px-2 py-1">
                  {streets.findIndex(s => s.id === selectedStreet.id) + 1} de {streets.length}
                </div>
              )}
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto px-4 py-6 flex gap-4 scrollbar-thin scrollbar-thumb-gray-300">
                {streets.map((street, index) => (
                  <StreetCard
                    key={street.id}
                    street={street}
                    index={index}
                    isSelected={selectedStreet?.id === street.id}
                    onClick={() => handleStreetClick(street)}
                  />
                ))}
              </div>

              {/* ANÚNCIO 4 */}
              <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-200/50">
                <div className="text-xs text-gray-600 text-center mb-2">
                  ⚠️ O CEP pode variar por bairro • Use as setas ← → para navegar
                </div>
                <AdSenseSlot slot="results-bottom" className="h-16" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}