"use client";

import { FormEvent, useState } from "react";
import { useStreetsStore } from "../lib/zustand/zustandStore";
import { StreetOutput } from "../types";

export default function SearchBar() {
  const { query, streets, loading, setQuery, fetchStreets, selectStreet } =
    useStreetsStore();

  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleChange = (value: string) => {
    setQuery(value);
    fetchStreets(value);
    setShowSuggestions(true); 
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) fetchStreets(query);
    setShowSuggestions(true);
  };

  const handleSelect = (street: StreetOutput) => {
    selectStreet(street);
    setShowSuggestions(false); 
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Nome da rua ou CEP..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>

      {streets.length > 0 && showSuggestions && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
          {streets.map((s) => (
            <div
              key={s.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(s)}
            >
              <div className="font-medium">{s.logradouro}</div>
              <div className="text-xs text-gray-500">
                {s.bairro} - {s.localidade} - {s.cep}
              </div>
            </div>
          ))}
        </div>
      )}

      {streets.length === 0 && query.length > 2 && !loading && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg p-2 text-center text-gray-500">
          Nenhuma rua encontrada.
        </div>
      )}
    </div>
  );
}
