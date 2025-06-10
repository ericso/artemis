import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FillupList } from '../FillupList';
import { FillupService } from '@/services/fillup.service';
import type { Fillup } from '@/services/fillup.service';

// Mock the window.confirm
const mockConfirm = vi.fn(() => true);
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
});

// Mock the FillupService
vi.mock('@/services/fillup.service', () => ({
  FillupService: {
    getFillups: vi.fn(),
    deleteFillup: vi.fn()
  }
}));

describe('FillupList', () => {
  const mockFillups: Fillup[] = [
    {
      id: '1',
      car_id: 'car1',
      date: new Date('2024-03-15'),
      gallons: 10.5,
      total_cost: 35.75,
      odometer_reading: 50000,
      station_address: 'Test Station',
      notes: 'Test Notes',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    },
    {
      id: '2',
      car_id: 'car1',
      date: new Date('2024-03-10'),
      gallons: 12.0,
      total_cost: 40.80,
      odometer_reading: 49500,
      station_address: null,
      notes: null,
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    }
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockClear();
  });

  it('renders loading state initially', async () => {
    const promise = new Promise<Fillup[]>((resolve) => setTimeout(() => resolve([]), 100));
    vi.mocked(FillupService.getFillups).mockImplementationOnce(() => promise);

    render(
      <FillupList
        carId="car1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Loading fillups...')).toBeInTheDocument();
    await promise;
  });

  it('renders fillups data correctly', async () => {
    vi.mocked(FillupService.getFillups).mockResolvedValueOnce(mockFillups);

    render(
      <FillupList
        carId="car1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading fillups...')).not.toBeInTheDocument();
    });

    // Check if fillups are displayed
    expect(screen.getByText('Test Station')).toBeInTheDocument();
    expect(screen.getByText('Test Notes')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument(); // Formatted odometer reading
    
    // Check for null values displayed as '-'
    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(2); // One for null station_address and one for null notes
  });

  it('handles empty fillups list', async () => {
    vi.mocked(FillupService.getFillups).mockResolvedValueOnce([]);

    render(
      <FillupList
        carId="car1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No fillups recorded yet.')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    vi.mocked(FillupService.getFillups).mockRejectedValueOnce(new Error('Failed to load'));

    render(
      <FillupList
        carId="car1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load fillups. Please try again.')).toBeInTheDocument();
    });

    // Test retry functionality
    vi.mocked(FillupService.getFillups).mockResolvedValueOnce(mockFillups);
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(screen.queryByText('Failed to load fillups. Please try again.')).not.toBeInTheDocument();
    });
  });

  it('calls onEdit when edit button is clicked', async () => {
    vi.mocked(FillupService.getFillups).mockResolvedValueOnce(mockFillups);

    render(
      <FillupList
        carId="car1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading fillups...')).not.toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockFillups[0]);
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    const deletePromise = Promise.resolve();
    vi.mocked(FillupService.getFillups).mockResolvedValueOnce(mockFillups);
    mockConfirm.mockImplementationOnce(() => true);
    mockOnDelete.mockImplementationOnce(() => deletePromise);

    render(
      <FillupList
        carId="car1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading fillups...')).not.toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this fillup?');
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockFillups[0]);
    
    await deletePromise;
  });

  it('does not call onDelete when delete is not confirmed', async () => {
    vi.mocked(FillupService.getFillups).mockResolvedValueOnce(mockFillups);
    mockConfirm.mockImplementationOnce(() => false);

    render(
      <FillupList
        carId="car1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading fillups...')).not.toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this fillup?');
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
}); 