import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword, generateToken } from '@utils/auth.utils';
import { UserService } from '@services/user.service';
import { User } from '@models/user';
import { PostgresUserService } from '@services/postgres-user.service';

interface AuthRequestBody {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export class AuthController {
  constructor(private userService: UserService = new PostgresUserService()) {}

  register = async (req: Request<Record<string, never>, AuthResponse, AuthRequestBody>, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const newUser: User = {
        id: uuidv4(),
        email,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      };

      const createdUser = await this.userService.create(newUser);
      const token = generateToken(createdUser);

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: createdUser.id,
          email: createdUser.email
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "Error registering user" });
    }
  };

  login = async (req: Request<Record<string, never>, AuthResponse, AuthRequestBody>, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      const user = await this.userService.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "Error logging in" });
    }
  };
}