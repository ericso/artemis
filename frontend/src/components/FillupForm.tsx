import { useState, useEffect } from 'react';
import { Fillup, CreateFillupDto, FillupService } from '@/services/fillup.service';

interface FillupFormProps {
  carId: string;
  fillup?: Fillup;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FillupForm({ carId, fillup, onSuccess, onCancel }: FillupFormProps) {
  const [formData, setFormData] = useState<CreateFillupDto>({
    car_id: carId,
    date: new Date(),
    gallons: 0,
    total_cost: 0,
    odometer_reading: 0,
    station_address: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fillup) {
      setFormData({
        car_id: fillup.car_id,
        date: new Date(fillup.date),
        gallons: fillup.gallons,
        total_cost: fillup.total_cost,
        odometer_reading: fillup.odometer_reading,
        station_address: fillup.station_address || '',
        notes: fillup.notes || '',
      });
    }
  }, [fillup]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'date' ? new Date(value) :
              ['gallons', 'total_cost'].includes(name) ? parseFloat(value) || 0 :
              name === 'odometer_reading' ? parseInt(value) || 0 :
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        gallons: Number(formData.gallons.toFixed(3)),
        total_cost: Number(formData.total_cost.toFixed(2))
      };

      if (fillup) {
        await FillupService.updateFillup(fillup.id, submissionData);
      } else {
        await FillupService.createFillup(submissionData);
      }
      onSuccess();
    } catch (err) {
      setError('Failed to save fillup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date *
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date.toISOString().split('T')[0]}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="gallons" className="block text-sm font-medium text-gray-700">
          Gallons * (up to 3 decimal places)
        </label>
        <input
          type="number"
          id="gallons"
          name="gallons"
          value={formData.gallons || ''}
          onChange={handleChange}
          required
          min="0"
          step="any"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="total_cost" className="block text-sm font-medium text-gray-700">
          Total Cost * (up to 2 decimal places)
        </label>
        <input
          type="number"
          id="total_cost"
          name="total_cost"
          value={formData.total_cost || ''}
          onChange={handleChange}
          required
          min="0"
          step="any"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="odometer_reading" className="block text-sm font-medium text-gray-700">
          Odometer Reading *
        </label>
        <input
          type="number"
          id="odometer_reading"
          name="odometer_reading"
          value={formData.odometer_reading || ''}
          onChange={handleChange}
          required
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="station_address" className="block text-sm font-medium text-gray-700">
          Station Address
        </label>
        <input
          type="text"
          id="station_address"
          name="station_address"
          value={formData.station_address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
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
          {isSubmitting ? 'Saving...' : fillup ? 'Update Fillup' : 'Add Fillup'}
        </button>
      </div>
    </form>
  );
} 