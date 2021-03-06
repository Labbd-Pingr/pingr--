import Account from '../model/account';
import Profile from '../model/profile';
import IAccountDataPort from '../ports/account_data_port';
import ILoginDataPort from '../ports/login_data_port';
import IProfileDataPort from '../ports/profile_data_port';
import AutheticationUsecases from './auth';
import { UsecaseResponse } from './interfaces/interface';
import { ICreateAccount } from './interfaces/interface.account';

export default class AccountUsecases {
  constructor(
    private readonly accountDataPort: IAccountDataPort,
    private readonly profileDataPort: IProfileDataPort,
    private readonly loginDataPort: ILoginDataPort
  ) {}

  public async createAccount({
    email,
    password,
    username,
    name,
    bio,
    birthDate,
  }: ICreateAccount): Promise<UsecaseResponse<Account>> {
    let profileDbId = '0';
    let account;
    try {
      const profile: Profile = new Profile(username, name, bio, birthDate);
      account = new Account(email, password, profile);

      profileDbId = await this.profileDataPort.create(profile);
      if (!profileDbId) return { succeed: false };

      account = await this.accountDataPort.create(account, profileDbId);
      if (!account) return { succeed: false };

      return {
        succeed: true,
        response: account,
      };
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Account was not able to be created! ${error.message}`
      );

      await this.profileDataPort.deleteById(profileDbId);
      if (account && account.id)
        await this.accountDataPort.deleteById(account.id);
      return {
        succeed: false,
        errors: error.message,
      };
    }
  }

  @AutheticationUsecases.authorize()
  public async deleteAccount(
    session: string,
    accountId: string
  ): Promise<UsecaseResponse<void>> {
    const sessionAccountId = await (
      await AutheticationUsecases.sessionUsecases.getAndValidateSession(session)
    ).response;
    const accounts = await this.accountDataPort.get({ id: sessionAccountId });

    if (accounts.length == 0)
      return {
        succeed: false,
      };

    if (accounts[0].id != accountId) {
      return {
        succeed: false,
        errors: 'You can only delete your own account!',
      };
    }

    await this.accountDataPort.deleteById(accounts[0].id);
    return {
      succeed: true,
    };
  }

  public async getAccountById(id: string): Promise<UsecaseResponse<Account>> {
    const accounts = await this.accountDataPort.get({ id });
    if (accounts.length == 0) {
      return {
        succeed: false,
        errors: 'Not Found',
      };
    }

    return {
      succeed: true,
      response: accounts[0],
    };
  }

  public async loginAccount(
    accountId: string,
    password: string
  ): Promise<UsecaseResponse<string>> {
    const getResponse = await this.getAccountById(accountId);

    if (!getResponse.response)
      return { succeed: false, errors: getResponse.errors };

    const account: Account = getResponse.response;
    if (account.password != password)
      return {
        succeed: false,
        errors: `Invalid password for account with id ${accountId}`,
      };

    const sessionId = await this.loginDataPort.logIn(accountId);
    return {
      succeed: true,
      response: sessionId,
    };
  }
}
