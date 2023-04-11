import {Document} from 'mongoose';

interface User extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

interface UserOutput {
  id: string;
  username: string;
  email: string;
  role?: 'admin' | 'user';
}

export {User, UserOutput};
