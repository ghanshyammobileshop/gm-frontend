import { User } from "./user";

export interface LoginUser {
    token: string;
    user: User;
}