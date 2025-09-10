"use client";

import { useStreetsStore } from "../lib/zustand/zustandStore";


export default function ResultsList() {
  const { streets, selectStreet } = useStreetsStore();

  if (streets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-medium">Nenhum resultado encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {streets.map((street: any) => (
        <div
          key={street.id}
          className="p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100"
          onClick={() => selectStreet(street)}
        >
          <div className="font-bold text-gray-800">{street.logradouro}</div>
          <div className="text-sm text-gray-600">
            {street.bairro} - {street.localidade} - {street.cep}
          </div>
        </div>
      ))}
    </div>
  );
}
