import { env } from '@/config/env.config';
import { db } from '@/database';
import {
  inflowCategoryTable,
  outflowCategoryTable,
  userTable,
} from '@/database/schemas';
import { resetPwdEmailTemplate } from '@/libraries/emails/resetPwdEmailTemplate';
import { PublicError } from '@/libraries/error.lib';
import { PasswordService } from '@/libraries/password.lib';
import { TokenService } from '@/libraries/token.lib';
import { DEFAULT_CATEGORIES } from '@/resources/category/category.constants';
import { eq, sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { sendEmail } from '../../libraries/resend.lib';
import type {
  ForgotPasswordDTO,
  InsertUserDTO,
  LoginUserDTO,
  ResetPasswordDTO,
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
          ? eq(sql`lower(${userTable.email})`, email.toLowerCase())
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
          email: email.toLowerCase(),
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
      where: eq(sql`lower(${userTable.email})`, email.toLowerCase()),
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

  loginGoogleUser = async ({
    email,
    googleId,
    fullName,
  }: {
    email: string;
    googleId: string;
    fullName: string;
  }): Promise<SelectUserDTO> => {
    const existingAccount = await db.query.userTable.findFirst({
      where: (table, { eq }) => eq(table.email, email),
    });

    if (!existingAccount) {
      return db.transaction(async trx => {
        const [createdUser] = await trx
          .insert(userTable)
          .values({
            email: email.toLowerCase(),
            fullName,
            googleId,
            isEmailVerified: true,
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
    }

    if (!existingAccount.googleId) {
      await db
        .update(userTable)
        .set({ isEmailVerified: true, googleId: googleId })
        .where(eq(userTable.id, existingAccount.id));
    }

    return {
      email: existingAccount.email,
      fullName: existingAccount.fullName,
      id: existingAccount.id,
      isEmailVerified: existingAccount.isEmailVerified,
    };
  };

  forgotPassword = async ({ email }: ForgotPasswordDTO) => {
    const user = await this.getUser({ email });
    if (!user) throw new PublicError(StatusCodes.NOT_FOUND, 'User not found');
    const resetToken = TokenService.generatePasswordResetToken({
      email,
    });

    const resetLink = `${env.CORS_ORIGIN}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'CashFlow - Password Reset',
      html: resetPwdEmailTemplate({ name: user.fullName, resetLink }),
    });

    return;
  };

  resetPassword = async ({ password, token }: ResetPasswordDTO) => {
    const verified = TokenService.verifyPasswordResetToken(token);
    if (!verified)
      throw new PublicError(StatusCodes.BAD_REQUEST, 'Invalid request');
    const { email } = verified;
    const user = await this.getUser({ email });
    if (!user) throw new PublicError(StatusCodes.NOT_FOUND, 'User not found');

    const passwordHash = PasswordService.hashUserPassword(password);

    await db
      .update(userTable)
      .set({ passwordHash, isEmailVerified: true })
      .where(eq(userTable.email, email));
    return;
  };
}
