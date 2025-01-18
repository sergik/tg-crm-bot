import { AppDataSource, User } from "./datasoruce";

export class UserStore {
  constructor(private tgId: string) {}
  public async getOrCreateUser(): Promise<User> {
    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOne({ where: { tgId: this.tgId } });
    if (user) {
      return user;
    }
    user = await userRepository.create({ tgId: this.tgId, googleAuthInfo: "" });
    return await userRepository.save(user);
  }

  public async saveGoogleToken(googleAuthInfo: string): Promise<void> {
    const user = await this.getOrCreateUser();
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.update({ id: user.id }, { googleAuthInfo });
  }

  public async loadGoogleToken(): Promise<string> {
    const user = await this.getOrCreateUser();
    return user.googleAuthInfo;
  }
}
