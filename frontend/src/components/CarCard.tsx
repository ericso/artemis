import React from 'react';
import { Car } from '../services/car.service';

interface CarCardProps {
  car: Car;
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            {car.name || `${car.year} ${car.make} ${car.model}`}
          </h3>
          <div className="text-gray-600">
            <p>Make: {car.make}</p>
            <p>Model: {car.model}</p>
            <p>Year: {car.year}</p>
            <p>Initial Mileage: {car.initial_mileage.toLocaleString()} miles</p>
            {car.vin && <p>VIN: {car.vin}</p>}
          </div>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => onEdit(car)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(car)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}; 