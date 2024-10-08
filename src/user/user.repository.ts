import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DATA_SOURCE_PROVIDER } from 'src/database/database.constants';
import { CreateUserRepositoryInput } from './user.dto';
import { User } from './user.type';

@Injectable()
export class UserRepository {
  constructor(@Inject(DATA_SOURCE_PROVIDER) private dataSource: Knex) {}

  async createUser(
    input: CreateUserRepositoryInput,
    transaction: Knex.Transaction,
  ) {
    return this.dataSource('user').transacting(transaction).insert(
      {
        name: input.name,
        avatar_url: input.avatarUrl,
      },
      ['id'],
    );
  }

  async getUser(userId: number): Promise<User | null> {
    return this.dataSource('user')
      .select('name', 'avatar_url as avatarUrl')
      .where('id', '=', userId)
      .whereNull('deleted_at')
      .first();
  }
}
