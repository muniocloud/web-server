import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './user.dto';
import { UserRepository } from './user.repository';
import { UploadService } from 'src/upload/upload.service';
import { Knex } from 'knex';
import { User } from 'src/auth/type';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private readonly uploadService: UploadService,
  ) {}

  async createUser(
    input: CreateUserInput,
    transaction: Knex.Transaction,
  ): Promise<number> {
    let avatarUrl: string | null = null;

    if (input.avatar) {
      avatarUrl = await this.uploadService.upload(input.avatar, 'avatar');
    }

    const [id] = await this.userRepository.createUser(
      {
        ...input,
        avatarUrl,
      },
      transaction,
    );

    return id;
  }

  async getUser(user: User) {
    return this.userRepository.getUser(user.id);
  }
}
