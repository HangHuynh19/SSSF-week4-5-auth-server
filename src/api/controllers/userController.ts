import bcrypt from 'bcryptjs';
import {Request, Response, NextFunction} from 'express';
import userModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import {User, UserOutput} from '../../interfaces/User';
import DBResponse from '../../interfaces/DBResponse';
import {validationResult} from 'express-validator';

const salt = bcrypt.genSaltSync(12);

const check = (req: Request, res: Response) => {
  res.json({message: 'Auth server is up and running'});
};

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userModel.find().select('-password -role');
    if (!users) {
      next(new CustomError('No users found', 404));
      return;
    }

    res.json(users);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userGet = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('-password -role');
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }

    res.json(user);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(message, 400));
      return;
    }

    const user = req.body;
    user.password = bcrypt.hashSync(user.password, salt);

    const newUser = await userModel.create(user);
    const response: DBResponse = {
      message: 'User created',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userPut = async (
  req: Request<{}, {}, User>,
  res: Response<{}, {user: UserOutput}>,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(message, 400));
      return;
    }

    const userFromToken = res.locals.user;
    const user = req.body;
    /* const updatedUser = {
      username: user.username ? user.username : userFromToken.username,
      email: user.email ? user.email : userFromToken.email,
      password: user.password
        ? bcrypt.hashSync(user.password, salt)
        : req.body.password,
    }; */

    const result = await userModel
      .findByIdAndUpdate(userFromToken.id, user, {
        new: true,
      })
      .select('-password -role');
    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: DBResponse = {
      message: 'User updated',
      user: {
        id: result._id,
        username: result.username,
        email: result.email,
      },
    };

    res.json(response);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

const userPutAsAdmin = async (
  req: Request<{}, {}, User>,
  res: Response<{}, {user: UserOutput}>,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(message, 400));
      return;
    }

    if (res.locals.user.role !== 'admin') {
      next(new CustomError('Unauthorized', 401));
      return;
    }

    const user = req.body;
    /* const updatedUser = {
      username: user.username ? user.username : user.username,
      email: user.email ? user.email : user.email,
      password: user.password
        ? bcrypt.hashSync(user.password, salt)
        : user.password,
      role: user.role ? user.role : user.role,
    }; */

    const result = await userModel
      .findByIdAndUpdate(user.id, user, {
        new: true,
      })
      .select('-password -role');
    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: DBResponse = {
      message: 'User updated',
      user: {
        id: result._id,
        username: result.username,
        email: result.email,
      },
    };

    res.json(response);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

const userDelete = async (
  req: Request,
  res: Response<{}, {user: UserOutput}>,
  next: NextFunction
) => {
  try {
    const userFromToken = res.locals.user;
    const result = await userModel.findByIdAndDelete(userFromToken.id);
    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: DBResponse = {
      message: 'User deleted',
      user: {
        id: result._id,
        username: result.username,
        email: result.email,
      },
    };

    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userDeleteAsAdmin = async (
  req: Request,
  res: Response<{}, {user: UserOutput}>,
  next: NextFunction
) => {
  try {
    if (res.locals.user.role !== 'admin') {
      next(new CustomError('Unauthorized', 401));
      return;
    }

    const result = await userModel.findByIdAndDelete(req.params.id);

    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: DBResponse = {
      message: 'User deleted',
      user: {
        id: result._id,
        username: result.username,
        email: result.email,
      },
    };

    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const checkToken = async (
  req: Request,
  res: Response<{}, {user: UserOutput}>
) => {
  const userFromToken = res.locals.user;
  const message: DBResponse = {
    message: 'Token is valid',
    user: userFromToken,
  };
  res.json(message);
};

export {
  check,
  userListGet,
  userGet,
  userPost,
  userPut,
  userPutAsAdmin,
  userDelete,
  userDeleteAsAdmin,
  checkToken,
};
