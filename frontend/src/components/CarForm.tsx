import React, { useState, useEffect } from 'react';
import { Car, CreateCarDto } from '../services/car.service';

interface CarFormProps {
  car?: Car;
  onSubmit: (carData: CreateCarDto) => Promise<void>;
  onCancel: () => void;
}

export const CarForm: React.FC<CarFormProps> = ({ car, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateCarDto>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    name: ''
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (car) {
      setFormData({
        make: car.make,
        model: car.model,
        year: car.year,
        vin: car.vin || '',
        name: car.name || ''
      });
    }
  }, [car]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const submitData = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        ...(formData.vin && { vin: formData.vin }),
        ...(formData.name && { name: formData.name })
      };
      await onSubmit(submitData);
      onCancel(); // Close form on success
    } catch (err) {
      setError('Failed to save car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form role="form" onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-gray-700">
            Make *
          </label>
          <input
            type="text"
            id="make"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
            Model *
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year *
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            min="1900"
            max={new Date().getFullYear() + 1}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
            VIN
          </label>
          <input
            type="text"
            id="vin"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nickname
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : car ? 'Update Car' : 'Add Car'}
          </button>
        </div>
      </div>
    </form>
  );
}; 