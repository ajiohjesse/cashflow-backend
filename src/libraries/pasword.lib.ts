import bcrypt from 'bcryptjs';

export class PasswordService {
  static hashUserPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    return passwordHash;
  }

  static verifyUserPassword(password: string, passwordHash: string) {
    return bcrypt.compareSync(password, passwordHash);
  }
}
