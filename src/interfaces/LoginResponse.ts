import {UserOutput} from './User';

export default interface LoginResponse {
  token: string;
  message: string;
  user: UserOutput;
}
