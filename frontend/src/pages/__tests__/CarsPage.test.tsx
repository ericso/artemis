import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { CarsPage } from '@/pages/CarsPage';
import { Car, CarService } from '@/services/car.service';
import { Mock } from 'vitest';

// Mock the car service
vi.mock('@/services/car.service', () => ({
  CarService: {
    getCars: vi.fn(),
    createCar: vi.fn(),
    updateCar: vi.fn(),
    deleteCar: vi.fn()
  }
}));

describe('CarsPage', () => {
  const mockCars = [
    {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      name: 'Daily Driver',
      vin: 'ABC123',
      initial_mileage: 50000,
      user_id: 'user1',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    },
    {
      id: '2',
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      name: null,
      vin: 'DEF456',
      initial_mileage: 75000,
      user_id: 'user1',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    }
  ] as Car[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    (CarService.getCars as Mock).mockImplementation(() => new Promise(() => {}));
    render(<CarsPage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display cars when loaded', async () => {
    (CarService.getCars as Mock).mockResolvedValue(mockCars);
    render(<CarsPage />);

    await waitFor(() => {
      expect(screen.getByText('Daily Driver')).toBeInTheDocument();
      expect(screen.getByText(/Toyota Camry • 2020/)).toBeInTheDocument();
      expect(screen.getByText(/2019 Honda Civic/)).toBeInTheDocument();
    });
  });

  it('should show empty state when no cars', async () => {
    (CarService.getCars as Mock).mockResolvedValue([]);
    render(<CarsPage />);

    await waitFor(() => {
      expect(screen.getByText('No cars found. Add your first car!')).toBeInTheDocument();
    });
  });

  it('should show error message when loading fails', async () => {
    (CarService.getCars as Mock).mockRejectedValue(new Error('Failed to load'));
    render(<CarsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load cars. Please try again.')).toBeInTheDocument();
    });
  });

  it('should select a car when clicked', async () => {
    (CarService.getCars as Mock).mockResolvedValue(mockCars);
    render(<CarsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Daily Driver/)).toBeInTheDocument();
    });

    const carElement = screen.getAllByText(/Daily Driver/)[0];
    fireEvent.click(carElement);
    
    // Wait for and verify the selection state
    await waitFor(() => {
      // Check that the car details are displayed
      expect(screen.getByRole('heading', { level: 2, name: 'Daily Driver' })).toBeInTheDocument();
      
      // Check that the car element has the selection classes
      expect(carElement.parentElement).toHaveClass('bg-blue-50');
      
      // Verify the car details are shown
      expect(screen.getByText('Make')).toBeInTheDocument();
      expect(screen.getByText('Toyota')).toBeInTheDocument();
      expect(screen.getByText('Model')).toBeInTheDocument();
      expect(screen.getByText('Camry')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
      expect(screen.getByText('2020')).toBeInTheDocument();
    });
  });

  it('should show form when Add Car is clicked', async () => {
    (CarService.getCars as Mock).mockResolvedValue(mockCars);
    render(<CarsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Add Car/)).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Car/ });
    fireEvent.click(addButton);
    expect(screen.getByText('Add New Car')).toBeInTheDocument();
  });

  it('should create a new car', async () => {
    const newCar = {
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      name: 'Electric Dream',
      initial_mileage: 0
    };

    (CarService.getCars as Mock).mockResolvedValue(mockCars);
    (CarService.createCar as Mock).mockResolvedValue({ id: '3', ...newCar, user_id: 'user1', created_at: new Date(), updated_at: null, deleted_at: null, vin: null });
    
    render(<CarsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Car/ })).toBeInTheDocument();
    });

    // Click the "Add Car" button in the header
    const addButtons = screen.getAllByRole('button', { name: /Add Car/ });
    const headerAddButton = addButtons.find(button => button.querySelector('svg'));
    if (!headerAddButton) throw new Error('Could not find header Add Car button');
    fireEvent.click(headerAddButton);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Make/), { target: { value: newCar.make } });
    fireEvent.change(screen.getByLabelText(/Model/), { target: { value: newCar.model } });
    fireEvent.change(screen.getByLabelText(/Year/), { target: { value: newCar.year } });
    fireEvent.change(screen.getByLabelText(/Nickname/), { target: { value: newCar.name } });

    // Click the submit button
    const form = screen.getByRole('form');
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) throw new Error('Could not find submit button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(CarService.createCar).toHaveBeenCalledWith(newCar);
      expect(CarService.getCars).toHaveBeenCalledTimes(2); // Initial load + after create
    });
  });

  it('should update an existing car', async () => {
    const updatedCar = {
      ...mockCars[0],
      name: 'Updated Name'
    };

    (CarService.getCars as Mock).mockResolvedValue(mockCars);
    (CarService.updateCar as Mock).mockResolvedValue(updatedCar);
    
    render(<CarsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Daily Driver/)).toBeInTheDocument();
    });

    // Select the car and click edit
    const carElement = screen.getAllByText(/Daily Driver/)[0];
    fireEvent.click(carElement);
    
    const editButton = screen.getByRole('button', { name: /Edit/ });
    fireEvent.click(editButton);

    // Update the name
    fireEvent.change(screen.getByLabelText(/Nickname/), { target: { value: updatedCar.name } });
    
    const updateButton = screen.getByRole('button', { name: /Update Car/ });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(CarService.updateCar).toHaveBeenCalledWith(mockCars[0].id, {
        make: mockCars[0].make,
        model: mockCars[0].model,
        year: mockCars[0].year,
        vin: mockCars[0].vin,
        name: updatedCar.name,
        initial_mileage: mockCars[0].initial_mileage
      });
      expect(CarService.getCars).toHaveBeenCalledTimes(2); // Initial load + after update
    });
  });

  it('should delete a car', async () => {
    (CarService.getCars as Mock).mockResolvedValue(mockCars);
    (CarService.deleteCar as Mock).mockResolvedValue(undefined);
    
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    render(<CarsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Daily Driver/)).toBeInTheDocument();
    });

    // Select the car and click delete
    const carElement = screen.getAllByText(/Daily Driver/)[0];
    fireEvent.click(carElement);
    
    const deleteButton = screen.getByRole('button', { name: /Delete/ });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(CarService.deleteCar).toHaveBeenCalledWith(mockCars[0].id);
      expect(CarService.getCars).toHaveBeenCalledTimes(2); // Initial load + after delete
    });

    confirmSpy.mockRestore();
  });

  it('should not delete a car if user cancels confirmation', async () => {
    (CarService.getCars as Mock).mockResolvedValue(mockCars);
    
    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => false);

    render(<CarsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Daily Driver/)).toBeInTheDocument();
    });

    // Select the car and click delete
    const carElement = screen.getAllByText(/Daily Driver/)[0];
    fireEvent.click(carElement);
    
    const deleteButton = screen.getByRole('button', { name: /Delete/ });
    fireEvent.click(deleteButton);

    expect(CarService.deleteCar).not.toHaveBeenCalled();
    expect(CarService.getCars).toHaveBeenCalledTimes(1); // Only initial load

    confirmSpy.mockRestore();
  });
}); 