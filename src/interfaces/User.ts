import { Request } from 'express';
import { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  acceptTerms: boolean;
  mobileNumber?: string;
  bio?: string;
  favoriteAnimal?: string;
  nationality?: string;
  companyName?: string;
  profileImage?: any;
  jobTitle?: string;
  status?: string;
  isVerified?: boolean;
  isDeleted?: boolean;
  address?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
  emailVerificationLinkToken?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  gender?: string;
  confirmationCode?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  userId?: Schema.Types.ObjectId;
  timestamps?: boolean;
  cart?: {
    items: {
      productId: Schema.Types.ObjectId;
      quantity: number;
    }[];
  };
}

export interface IRequestUser extends Request {
  user: IUser;
}

export interface IAuthRequest extends Request {
  headers: { authorization?: string; Authorization?: string };
  cookies: { authToken?: string; accessToken?: string; refreshToken?: string };
  user?: IUser;
}

export type CartItemT = {
  productId: string;
  quantity: number;
};