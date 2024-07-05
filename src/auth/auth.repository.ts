import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATA_SOURCE_PROVIDER } from 'src/database/database.constants';
import { AuthUser, CreateAuthUserInput } from './type';

@Injectable()
export class AuthRepository {
  constructor(@Inject(DATA_SOURCE_PROVIDER) private dataSource: Knex) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const authUser = await this.dataSource('auth')
      .select(['email', 'password', 'provider', 'provider_id', 'id', 'user_id'])
      .where('email', '=', email.toLowerCase())
      .whereNull('deleted_at')
      .first();

    if (!authUser) {
      return null;
    }

    return {
      email: authUser.email,
      password: authUser.password,
      provider: authUser.provider,
      providerId: authUser.provider_id,
      id: authUser.id,
      userId: authUser.user_id,
    };
  }

  async createAuthUser(
    input: CreateAuthUserInput,
    transaction: Knex.Transaction,
  ) {
    const [id] = await this.dataSource('auth').transacting(transaction).insert(
      {
        user_id: input.userId,
        email: input.email,
        password: input.password,
        provider: input.provider,
      },
      ['id'],
    );

    return id;
  }
}
