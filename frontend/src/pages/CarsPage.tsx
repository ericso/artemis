import React, { useState, useEffect } from 'react';
import { Car, CarService, CreateCarDto } from '@/services/car.service';
import { CarForm } from '@/components/CarForm';

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
      setError('Failed to create car. Please try again.');
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
      setError('Failed to update car. Please try again.');
    }
  };

  const handleDeleteCar = async (car: Car) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      await CarService.deleteCar(car.id);
      await loadCars();
      if (selectedCar?.id === car.id) {
        setSelectedCar(undefined);
      }
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

  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div 
          data-testid="loading-spinner"
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} 
        />
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'row'
    }}>
      {/* Left Sidebar - Car List */}
      <div style={{
        width: '33.333333%',
        minWidth: '300px',
        borderRight: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        overflowY: 'auto'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827'
            }}>My Cars</h2>
            <button
              onClick={() => {
                setSelectedCar(undefined);
                setShowForm(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.375rem 0.75rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <svg style={{
                width: '0.875rem',
                height: '0.875rem',
                marginRight: '0.25rem'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Car
            </button>
          </div>
        </div>

        <div>
          {cars.length === 0 ? (
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              No cars found. Add your first car!
            </div>
          ) : (
            cars.map(car => (
              <div
                key={car.id}
                onClick={() => handleSelectCar(car)}
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  backgroundColor: selectedCar?.id === car.id ? '#eff6ff' : 'transparent',
                  borderLeft: selectedCar?.id === car.id ? '4px solid #3b82f6' : 'none'
                }}
              >
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  color: '#111827'
                }}>
                  {car.name || `${car.year} ${car.make} ${car.model}`}
                </h3>
                <p style={{
                  marginTop: '0.25rem',
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  {car.make} {car.model} • {car.year}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Content - Car Details/Form */}
      <div style={{
        flex: 1,
        backgroundColor: 'white',
        overflowY: 'auto',
        padding: '1.5rem'
      }}>
        {showForm ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827'
              }}>
                {selectedCar ? 'Edit Car' : 'Add New Car'}
              </h2>
              <p style={{
                marginTop: '0.25rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {selectedCar ? 'Update the details of your car.' : 'Add a new car to your collection.'}
              </p>
            </div>
            <CarForm
              car={selectedCar}
              onSubmit={selectedCar ? handleUpdateCar : handleCreateCar}
              onCancel={handleCancel}
            />
          </>
        ) : selectedCar ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827'
                }}>
                  {selectedCar.name || `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`}
                </h2>
                <p style={{
                  marginTop: '0.25rem',
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  Detailed information about your vehicle
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(selectedCar)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'white',
                    color: '#3b82f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <svg style={{
                    width: '0.875rem',
                    height: '0.875rem',
                    marginRight: '0.25rem'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCar(selectedCar)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'white',
                    color: '#ef4444',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <svg style={{
                    width: '0.875rem',
                    height: '0.875rem',
                    marginRight: '0.25rem'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.375rem' }}>
              <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
                <div>
                  <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Make</dt>
                  <dd style={{ marginTop: '0.25rem', fontSize: '1rem', fontWeight: '500', color: '#111827' }}>{selectedCar.make}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Model</dt>
                  <dd style={{ marginTop: '0.25rem', fontSize: '1rem', fontWeight: '500', color: '#111827' }}>{selectedCar.model}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Year</dt>
                  <dd style={{ marginTop: '0.25rem', fontSize: '1rem', fontWeight: '500', color: '#111827' }}>{selectedCar.year}</dd>
                </div>
                {selectedCar.vin && (
                  <div>
                    <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>VIN</dt>
                    <dd style={{ marginTop: '0.25rem', fontSize: '1rem', fontWeight: '500', color: '#111827', fontFamily: 'monospace' }}>{selectedCar.vin}</dd>
                  </div>
                )}
                {selectedCar.name && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Nickname</dt>
                    <dd style={{ marginTop: '0.25rem', fontSize: '1rem', fontWeight: '500', color: '#111827' }}>{selectedCar.name}</dd>
                  </div>
                )}
              </dl>
            </div>
          </>
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#111827'
              }}>No car selected</h3>
              <p style={{
                marginTop: '0.25rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>Select a car from the list to view its details</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          backgroundColor: '#fef2f2',
          color: '#b91c1c',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flexShrink: 0 }}>
              <svg style={{
                width: '0.875rem',
                height: '0.875rem',
                color: '#f87171'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={{ marginLeft: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem' }}>{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 