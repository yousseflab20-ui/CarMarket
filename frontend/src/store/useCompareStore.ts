import { create } from 'zustand';
import { Car } from '../types/car';

interface CompareState {
  cars: Car[];
  addCar: (car: Car) => void;
  removeCar: (id: number) => void;
  clearAll: () => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  cars: [],
  addCar: (car) => set((state) => {
    if (state.cars.length >= 3) return state; // Maximum 3 cars
    if (state.cars.some(c => c.id === car.id)) return state; // Already exists
    return { cars: [...state.cars, car] };
  }),
  removeCar: (id) => set((state) => ({
    cars: state.cars.filter(c => c.id !== id)
  })),
  clearAll: () => set({ cars: [] }),
}));
