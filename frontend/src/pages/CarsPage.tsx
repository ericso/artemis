import React, { useState, useEffect } from 'react';
import { Car, CarService, CreateCarDto } from '../services/car.service';
import { CarCard } from '../components/CarCard';
import { CarForm } from '../components/CarForm';

export const CarsPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await CarService.getCars();
      setCars(data);
      setError('');
    } catch (err) {
      setError('Failed to load cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleCreateCar = async (carData: CreateCarDto) => {
    try {
      await CarService.createCar(carData);
      await loadCars();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateCar = async (carData: CreateCarDto) => {
    if (!selectedCar) return;
    try {
      await CarService.updateCar(selectedCar.id, carData);
      await loadCars();
      setShowForm(false);
      setSelectedCar(undefined);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteCar = async (car: Car) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      await CarService.deleteCar(car.id);
      await loadCars();
    } catch (err) {
      setError('Failed to delete car. Please try again.');
    }
  };

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCar(undefined);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Cars</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add New Car
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm ? (
        <div className="mb-6">
          <CarForm
            car={selectedCar}
            onSubmit={selectedCar ? handleUpdateCar : handleCreateCar}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {cars.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              No cars found. Add your first car!
            </div>
          ) : (
            cars.map(car => (
              <CarCard
                key={car.id}
                car={car}
                onEdit={handleEdit}
                onDelete={handleDeleteCar}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}; 