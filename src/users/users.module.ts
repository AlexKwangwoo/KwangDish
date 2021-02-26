import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  //import를 통해 service에서 repository사용가능하게 했음!
  providers: [UserResolver, UserService],
})
export class UsersModule {}
