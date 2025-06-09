import { RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword, generateToken } from '@utils/auth.utils';
import { UserService } from '@services/user.service';
import { User } from '@models/user';
import { PostgresUserService } from '@services/postgres-user.service';

export interface AuthRequestBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
  };
}

export class AuthController {
  constructor(private userService: UserService = new PostgresUserService()) {}

  register: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { email, password } = req.body as AuthRequestBody;

      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
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

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: createdUser.id,
          email: createdUser.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error registering user" });
    }
  };

  login: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { email, password } = req.body as AuthRequestBody;

      const user = await this.userService.findByEmail(email);
      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const token = generateToken(user);

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  };
}