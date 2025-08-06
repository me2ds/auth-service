import { User } from "../../user/entity/user.entity";

export interface JwtPayload {
  user: User
}