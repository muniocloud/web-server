import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATA_SOURCE_PROVIDER } from 'src/database/database.constants';
import { CreateUserRepositoryInput } from './user.dto';
import { User } from './user.type';

@Injectable()
export class UserRepository {
  constructor(@Inject(DATA_SOURCE_PROVIDER) private dataSource: Knex) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.dataSource('auth')
      .select(['email', 'password', 'provider', 'provider_id', 'id'])
      .where('email', '=', email.toLowerCase())
      .whereNull('deleted_at')
      .first();
  }

  async createUser(input: CreateUserRepositoryInput) {
    const transactionProvider = await this.dataSource.transactionProvider();
    const trx = await transactionProvider();

    try {
      const [userId] = await trx('user').insert(
        {
          name: input.name,
          avatar_url: input.avatarUrl,
        },
        ['id'],
      );
      const [id] = await trx('auth').insert(
        {
          user_id: userId,
          email: input.email,
          password: input.password,
          provider: 'local',
        },
        ['id'],
      );

      trx.commit();

      return id;
    } catch (error) {
      trx.rollback();
      throw error;
    }
  }
}
