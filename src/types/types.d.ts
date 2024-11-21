export interface IUser {
  id: number;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt?: string;
}
