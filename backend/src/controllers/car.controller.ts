import { Response } from 'express';
import { PostgresCarService } from '@services/postgres-car.service';
import { Car } from '@models/car';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '@middleware/auth.middleware';

export class CarController {
  private carService: PostgresCarService;

  constructor() {
    this.carService = new PostgresCarService();
  }

  getCars = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const cars = await this.carService.findByUserId(userId);
      res.json(cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      res.status(500).json({ message: 'Error fetching cars' });
    }
  };

  createCar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { make, model, year, vin, name } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const car: Car = {
        id: uuidv4(),
        make,
        model,
        year,
        vin,
        name,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      };

      const newCar = await this.carService.create(car);
      res.status(201).json(newCar);
    } catch (error) {
      console.error('Error creating car:', error);
      res.status(500).json({ message: 'Error creating car' });
    }
  };

  updateCar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const updateData = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // First check if the car exists and belongs to the user
      const existingCar = await this.carService.findById(id);
      if (!existingCar) {
        res.status(404).json({ message: 'Car not found' });
        return;
      }

      if (existingCar.user_id !== userId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const updatedCar = await this.carService.update(id, updateData);
      if (!updatedCar) {
        res.status(404).json({ message: 'Car not found' });
        return;
      }

      res.json(updatedCar);
    } catch (error) {
      console.error('Error updating car:', error);
      res.status(500).json({ message: 'Error updating car' });
    }
  };

  deleteCar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // First check if the car exists and belongs to the user
      const existingCar = await this.carService.findById(id);
      if (!existingCar) {
        res.status(404).json({ message: 'Car not found' });
        return;
      }

      if (existingCar.user_id !== userId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      await this.carService.softDelete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting car:', error);
      res.status(500).json({ message: 'Error deleting car' });
    }
  };
} 