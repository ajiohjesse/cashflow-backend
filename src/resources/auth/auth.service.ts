import { DEFAULT_CATEGORIES } from '@/constants/category.constants';
import { db } from '@/database';
import {
  inflowCategoryTable,
  outflowCategoryTable,
  userTable,
} from '@/database/schemas';
import { PublicError } from '@/libraries/error.lib';
import { PasswordService } from '@/libraries/pasword.lib';
import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import type {
  InsertUserDTO,
  LoginUserDTO,
  SelectUserDTO,
} from './auth.validators';

export class AuthService {
  getUser = async (
    fields: { id: string; email?: never } | { id?: never; email: string }
  ): Promise<SelectUserDTO | null> => {
    const { email, id } = fields;
    if (!email && !id) {
      return null;
    }

    const userData = await db.query.userTable.findFirst({
      where: id
        ? eq(userTable.id, id)
        : email
          ? eq(userTable.email, email)
          : undefined,
    });

    if (!userData) {
      return null;
    }

    return {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      isEmailVerified: userData.isEmailVerified,
    };
  };

  register = async (user: InsertUserDTO): Promise<SelectUserDTO> => {
    const { email, fullName, password } = user;

    const passwordHash = PasswordService.hashUserPassword(password);

    return db.transaction(async trx => {
      const [createdUser] = await trx
        .insert(userTable)
        .values({
          email,
          fullName,
          passwordHash,
        })
        .returning();

      await trx.insert(inflowCategoryTable).values(
        DEFAULT_CATEGORIES.inflow.map(category => ({
          name: category,
          userId: createdUser.id,
        }))
      );
      await trx.insert(outflowCategoryTable).values(
        DEFAULT_CATEGORIES.outflow.map(category => ({
          name: category,
          userId: createdUser.id,
        }))
      );

      return {
        id: createdUser.id,
        fullName: createdUser.fullName,
        email: createdUser.email,
        isEmailVerified: createdUser.isEmailVerified,
      };
    });
  };

  login = async (user: LoginUserDTO): Promise<SelectUserDTO> => {
    const { email, password } = user;
    const userData = await db.query.userTable.findFirst({
      where: (table, { eq }) => eq(table.email, email),
    });

    if (!userData || !userData.passwordHash) {
      throw new PublicError(
        StatusCodes.UNAUTHORIZED,
        'Invalid email or password'
      );
    }

    const isPasswordCorrect = PasswordService.verifyUserPassword(
      password,
      userData.passwordHash
    );

    if (!isPasswordCorrect) {
      throw new PublicError(
        StatusCodes.UNAUTHORIZED,
        'Invalid email or password'
      );
    }

    return {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      isEmailVerified: userData.isEmailVerified,
    };
  };
}
