import { useState, useEffect } from 'react';
import { Fillup, FillupService } from '@/services/fillup.service';
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils';

interface FillupListProps {
  carId: string;
  onEdit: (fillup: Fillup) => void;
  onDelete: (fillup: Fillup) => void;
}

export function FillupList({ carId, onEdit, onDelete }: FillupListProps) {
  const [fillups, setFillups] = useState<Fillup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFillups();
  }, [carId]);

  const loadFillups = async () => {
    try {
      setLoading(true);
      const data = await FillupService.getFillups(carId);
      setFillups(data);
      setError(null);
    } catch (err) {
      setError('Failed to load fillups. Please try again.');
      console.error('Error loading fillups:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading fillups...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error}
        <button
          onClick={() => loadFillups()}
          className="ml-2 text-blue-500 hover:text-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (fillups.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No fillups recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gallons
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Cost
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price/Gallon
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Odometer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Station
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {fillups.map((fillup) => (
            <tr key={fillup.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(fillup.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatNumber(fillup.gallons, 3)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(fillup.total_cost)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(fillup.total_cost / fillup.gallons)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {fillup.odometer_reading.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {fillup.station_address || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {fillup.notes || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(fillup)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this fillup?')) {
                      onDelete(fillup);
                    }
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 