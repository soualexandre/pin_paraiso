import { StreetOutput } from "@/app/types";
import { create } from "zustand";

interface StreetsState {
  query: string;
  streets: StreetOutput[];
  selectedStreet: StreetOutput | null;
  loading: boolean;
  setQuery: (query: string) => void;
  fetchStreets: (query: string) => Promise<void>;
  selectStreet: (street: StreetOutput) => void;
  clearStreets: () => void;
}

export const useStreetsStore = create<StreetsState>((set, get) => ({
  query: "",
  streets: [],
  selectedStreet: null,
  loading: false,

  setQuery: (query) => set({ query }),

  fetchStreets: async (query) => {
    if (!query || query.length < 3) return;
    set({ loading: true });
    console.log("query", query);
    try {
      const res = await fetch("/api/cep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: query }),
      });

      const data: StreetOutput[] = await res.json();
      set({ streets: data, loading: false });
    } catch (err) {
      console.error(err);
      set({ streets: [], loading: false });
    }
  },

  selectStreet: (street) => {
    set({
      selectedStreet: street,
      streets: [street], 
      query: street.logradouro,
    });
  },

  clearStreets: () => set({ streets: [], selectedStreet: null }),
}));
