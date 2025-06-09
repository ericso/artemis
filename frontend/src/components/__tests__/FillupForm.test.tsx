import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FillupForm } from '../FillupForm';
import { FillupService } from '@/services/fillup.service';
import type { Fillup } from '@/services/fillup.service';

// Mock the FillupService
vi.mock('@/services/fillup.service', () => ({
  FillupService: {
    createFillup: vi.fn(),
    updateFillup: vi.fn()
  }
}));

describe('FillupForm', () => {
  const mockCarId = 'car1';
  const mockFillup: Fillup = {
    id: '1',
    car_id: mockCarId,
    date: new Date('2024-03-15'),
    gallons: 10.5,
    total_cost: 35.75,
    odometer_reading: 50000,
    station_address: 'Test Station',
    notes: 'Test Notes',
    created_at: new Date(),
    updated_at: null,
    deleted_at: null
  };

  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty form correctly', () => {
    render(
      <FillupForm
        carId={mockCarId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Check if all form fields are present
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gallons/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total cost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/odometer reading/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/station address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();

    // Check if buttons are present
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add fillup/i })).toBeInTheDocument();
  });

  it('renders form with fillup data correctly', () => {
    render(
      <FillupForm
        carId={mockCarId}
        fillup={mockFillup}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Check if form fields are populated with fillup data
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
    expect(dateInput.value).toBe('2024-03-15');
    expect(screen.getByLabelText(/gallons/i)).toHaveValue(10.5);
    expect(screen.getByLabelText(/total cost/i)).toHaveValue(35.75);
    expect(screen.getByLabelText(/odometer reading/i)).toHaveValue(50000);
    expect(screen.getByLabelText(/station address/i)).toHaveValue('Test Station');
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Test Notes');

    // Check if update button is present
    expect(screen.getByRole('button', { name: /update fillup/i })).toBeInTheDocument();
  });

  it('handles form submission for new fillup', async () => {
    vi.mocked(FillupService.createFillup).mockResolvedValueOnce(mockFillup);

    render(
      <FillupForm
        carId={mockCarId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-03-15' } });
    fireEvent.change(screen.getByLabelText(/gallons/i), { target: { value: '10.5' } });
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: '35.75' } });
    fireEvent.change(screen.getByLabelText(/odometer reading/i), { target: { value: '50000' } });
    fireEvent.change(screen.getByLabelText(/station address/i), { target: { value: 'Test Station' } });
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'Test Notes' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add fillup/i }));

    // Check if the submit button is disabled and shows loading state
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();

    await waitFor(() => {
      expect(FillupService.createFillup).toHaveBeenCalledWith({
        car_id: mockCarId,
        date: expect.any(Date),
        gallons: 10.5,
        total_cost: 35.75,
        odometer_reading: 50000,
        station_address: 'Test Station',
        notes: 'Test Notes'
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles form submission for updating fillup', async () => {
    vi.mocked(FillupService.updateFillup).mockResolvedValueOnce(mockFillup);

    render(
      <FillupForm
        carId={mockCarId}
        fillup={mockFillup}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Modify some fields
    fireEvent.change(screen.getByLabelText(/gallons/i), { target: { value: '11.5' } });
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: '40.25' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update fillup/i }));

    await waitFor(() => {
      expect(FillupService.updateFillup).toHaveBeenCalledWith(mockFillup.id, {
        car_id: mockCarId,
        gallons: 11.5,
        total_cost: 40.25
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles form submission error', async () => {
    vi.mocked(FillupService.createFillup).mockRejectedValueOnce(new Error('Failed to save'));

    render(
      <FillupForm
        carId={mockCarId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-03-15' } });
    fireEvent.change(screen.getByLabelText(/gallons/i), { target: { value: '10.5' } });
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: '35.75' } });
    fireEvent.change(screen.getByLabelText(/odometer reading/i), { target: { value: '50000' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add fillup/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save fillup. Please try again.')).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles cancel button click', () => {
    render(
      <FillupForm
        carId={mockCarId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    render(
      <FillupForm
        carId={mockCarId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /add fillup/i }));

    // Check if the form was not submitted
    expect(FillupService.createFillup).not.toHaveBeenCalled();
  });
}); 