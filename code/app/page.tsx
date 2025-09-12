"use client";

import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import ResultsList from "./components/ResultList";
import SearchBar from "./components/SearchBar";
import { useStreetsStore } from "./lib/zustand/zustandStore";
import { Location, StreetOutput } from "./types";

const StreetMap = dynamic(() => import("./components/StreetMap"), { ssr: false });

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
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        select-none
      `}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Selecionar ${street.logradouro}, ${street.bairro || street.uf}, CEP ${street.cep}`}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      )}

      <div className="mb-3">
        <h4 
          className={`
            font-bold text-base leading-tight truncate
            ${isSelected ? 'text-blue-900' : 'text-gray-900'}
          `}
          title={street.logradouro}
        >
          {street.logradouro}
        </h4>
        
        <div className="mt-1">
          <span className={`
            inline-block px-2 py-1 text-xs font-medium rounded-full
            ${isSelected 
              ? 'bg-blue-200 text-blue-800' 
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            #{index + 1}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {street.bairro && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 min-w-0">Bairro:</span>
            <span 
              className={`text-sm truncate ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}
              title={street.bairro}
            >
              {street.bairro}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 min-w-0">Cidade:</span>
          <span 
            className={`text-sm truncate ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}
            title={street.localidade}
          >
            {street.localidade}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 min-w-0">CEP:</span>
          <span 
            className={`text-sm font-mono font-medium ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}
          >
            {street.cep}
          </span>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <span className={`
          text-xs font-medium
          ${isSelected ? 'text-blue-600' : 'text-gray-400'}
        `}>
          {isSelected ? '✓ Selecionado' : 'Clique para selecionar'}
        </span>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const { streets, selectedStreet, selectStreet, clearStreets, fetchStreets } = useStreetsStore();

  const [canScroll, setCanScroll] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        window.innerWidth < 1024 &&
        showResults &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showResults]);

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
            selectStreet(streets[currentIndex - 1]);
            handleSelectStreet(streets[currentIndex - 1]);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentIndex < streets.length - 1) {
            selectStreet(streets[currentIndex + 1]);
            handleSelectStreet(streets[currentIndex + 1]);
          }
          break;
        case 'Home':
          event.preventDefault();
          if (streets.length > 0) {
            selectStreet(streets[0]);
            handleSelectStreet(streets[0]);
          }
          break;
        case 'End':
          event.preventDefault();
          if (streets.length > 0) {
            selectStreet(streets[streets.length - 1]);
            handleSelectStreet(streets[streets.length - 1]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [streets, selectedStreet, selectStreet]);

  const handleSelectStreet = (street: StreetOutput) => {
    try {
      selectStreet(street);
      setSelectedLocation({
        city: street.localidade,
        street: street.logradouro,
        zipCode: street.cep,
        neighborhood: street.bairro || street.uf,
        bairro: street.bairro,
        lat: street.latitude,
        lng: street.longitude,
      });

      if (window.innerWidth < 1024) {
        setShowResults(false);
        setIsSearchFocused(false);
      }

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Erro ao selecionar rua:', error);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowResults(true);
  };

  const handleSelectLocation = async (location: Location) => {
    setSelectedLocation(location);
    clearStreets(); 
    if (!location.street) return;

    try {
      await fetchStreets(location.street);
    } catch (err) {
      console.error('Erro ao buscar ruas:', err);
    }
  };

  return (
    <>
      <Head>
        <title>PinParaíso - Encontre seu endereço</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta
          name="description"
          content="Encontre e explore endereços em Paraíso do Tocantins"
        />
      </Head>

      <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex flex-col w-96 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20">
          <div className="px-6 py-8 border-b border-gray-100/50">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PinParaíso
            </h1>
            <p className="text-xs text-gray-500 font-medium">Explore endereços</p>
          </div>

          <div className="px-6 py-6">
            <SearchBar />
          </div>

          <div className="flex-1 overflow-hidden px-6 pb-6">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <ResultsList />
            </div>
          </div>
        </aside>

        <main className="flex-1 relative overflow-hidden">
          <div className="lg:hidden absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-b border-white/20 p-4 shadow-sm">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PinParaíso
            </h1>

            <div ref={searchContainerRef}>
              <SearchBar />
            </div>
          </div>

          {showResults && (
            <div
              ref={resultsRef}
              className="lg:hidden absolute top-full left-0 right-0 z-30 bg-white/95 backdrop-blur-xl shadow-lg border-t border-gray-200 max-h-[70vh] overflow-hidden"
              style={{ top: "calc(100% + 1px)" }}
            >
              <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                <ResultsList />
              </div>
            </div>
          )}

          <div className="h-full w-full pt-[112px] lg:pt-0">
            <StreetMap
              selectedLocation={selectedLocation}
              streets={streets}
              onSelectLocation={handleSelectLocation}
            />
          </div>

          {streets.length > 0 && !showResults && (
            <div className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:left-8 lg:right-8 z-20">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {streets.length} endereço{streets.length > 1 ? 's' : ''} encontrado{streets.length > 1 ? 's' : ''}
                  </h3>
                  {streets.length > 1 && (
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      • Use as setas ← → para navegar
                    </span>
                  )}
                </div>
                
                {streets.length > 1 && selectedStreet && (
                  <div className="text-xs text-gray-500 bg-white/80 rounded-full px-2 py-1">
                    {streets.findIndex(s => s.id === selectedStreet.id) + 1} de {streets.length}
                  </div>
                )}
              </div>

              <div 
                ref={listContainerRef}
                className="bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              >
                <div 
                  className="overflow-x-auto px-4 py-6 flex gap-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                  style={{
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {streets.map((street, index) => (
                    <StreetCard
                      key={`${street.id}-${street.cep}`}
                      street={street}
                      index={index}
                      isSelected={selectedStreet?.id === street.id}
                      onClick={() => handleSelectStreet(street)}
                    />
                  ))}
                </div>

                <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-200/50">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        ⚠️ <span className="hidden sm:inline">O CEP da rua pode variar por bairro</span>
                        <span className="sm:hidden">CO CEP da rua pode variar por bairro</span>
                      </span>
                      
                      {streets.length > 1 && (
                        <span className="hidden lg:flex items-center gap-1">
                          ⌨️ Use as setas para navegar
                        </span>
                      )}
                    </div>
                    
                    {streets.length > 3 && (
                      <button
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        onClick={() => {
                          if (listContainerRef.current) {
                            const container = listContainerRef.current.querySelector('.overflow-x-auto');
                            if (container) {
                              container.scrollTo({ left: 0, behavior: 'smooth' });
                            }
                          }
                        }}
                      >
                        ← Voltar ao início
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}