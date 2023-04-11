import {Request, Response, NextFunction} from 'express';
import userModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcryptjs';
import {UserOutput} from '../../interfaces/User';
import jwt from 'jsonwebtoken';
import LoginResponse from '../../interfaces/LoginResponse';

const login = async (
  req: Request<{}, {}, {username: string; password: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {username, password} = req.body;
    const user = await userModel.findOne({email: username});
    if (!user) {
      next(new CustomError('Invalid username or password', 200));
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      next(new CustomError('Invalid username or password', 200));
      return;
    }

    const token = jwt.sign(
      {id: user._id, role: user.role},
      process.env.JWT_SECRET as string
    );

    const userOutput: UserOutput = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const message: LoginResponse = {
      message: 'Login successful',
      token,
      user: userOutput,
    };

    res.json(message);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export {login};
