import {UserOutput} from './User';

export default interface DBResponse {
  message: string;
  user?: UserOutput;
}
