import { Response } from 'express';
import { PostgresFillupService } from '@services/postgres-fillup.service';
import { PostgresCarService } from '@services/postgres-car.service';
import { Fillup } from '@models/fillup';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '@middleware/auth.middleware';

export class FillupController {
  private fillupService: PostgresFillupService;
  private carService: PostgresCarService;

  constructor() {
    this.fillupService = new PostgresFillupService();
    this.carService = new PostgresCarService();
  }

  createFillup = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { car_id, date, gallons, total_cost, odometer_reading, station_address, notes } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // First check if the car exists and belongs to the user
      const car = await this.carService.findById(car_id);
      if (!car) {
        res.status(404).json({ message: 'Car not found' });
        return;
      }

      if (car.user_id !== userId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const fillup: Fillup = {
        id: uuidv4(),
        car_id,
        date: new Date(date),
        gallons,
        total_cost,
        odometer_reading,
        station_address,
        notes,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      };

      const newFillup = await this.fillupService.create(fillup);
      res.status(201).json(newFillup);
    } catch (error) {
      console.error('Error creating fillup:', error);
      res.status(500).json({ message: 'Error creating fillup' });
    }
  };

  updateFillup = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const updateData = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // First check if the fillup exists
      const existingFillup = await this.fillupService.findById(id);
      if (!existingFillup) {
        res.status(404).json({ message: 'Fillup not found' });
        return;
      }

      // Check if the car exists and belongs to the user
      const car = await this.carService.findById(existingFillup.car_id);
      if (!car) {
        res.status(404).json({ message: 'Car not found' });
        return;
      }

      if (car.user_id !== userId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      // Convert date string to Date object if it's being updated
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const updatedFillup = await this.fillupService.update(id, updateData);
      if (!updatedFillup) {
        res.status(404).json({ message: 'Fillup not found' });
        return;
      }

      res.json(updatedFillup);
    } catch (error) {
      console.error('Error updating fillup:', error);
      res.status(500).json({ message: 'Error updating fillup' });
    }
  };

  deleteFillup = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // First check if the fillup exists
      const existingFillup = await this.fillupService.findById(id);
      if (!existingFillup) {
        res.status(404).json({ message: 'Fillup not found' });
        return;
      }

      // Check if the car exists and belongs to the user
      const car = await this.carService.findById(existingFillup.car_id);
      if (!car) {
        res.status(404).json({ message: 'Car not found' });
        return;
      }

      if (car.user_id !== userId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      await this.fillupService.softDelete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting fillup:', error);
      res.status(500).json({ message: 'Error deleting fillup' });
    }
  };
} 