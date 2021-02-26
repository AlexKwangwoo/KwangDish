import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';
import { LoginInput } from './dtos/login.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  //input을 받게될것이다!
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    {
      try {
        const exists = await this.users.findOne({ email });
        if (exists) {
          return {
            ok: false,
            error: 'There is a user with that email already',
          };
        }
        //아이디가 없다면 만들자!
        //..create는..자바스크립트에는 저장하지만 db에는 저장하는게 아님
        //그래서 save해줘야함!! save는 promise를 리턴함!
        //여기서 save되기전에 password가 hash 된다!!
        await this.users.save(this.users.create({ email, password, role }));
        return { ok: true };
      } catch (e) {
        //make error
        return { ok: false, error: "Couldn't create account" };
      }
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    // make a JWT and give it to the user
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      return {
        ok: true,
        token: 'lalalalaalala',
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
