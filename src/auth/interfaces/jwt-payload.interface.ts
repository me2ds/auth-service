import { User } from "src/user/entity/user.entity";

export interface JwtPayload {
  user: User
}