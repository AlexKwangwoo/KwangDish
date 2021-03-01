import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
  // imports: [TypeOrmModule.forFeature([User]), ConfigService],
  // 글로벌로 설정된것들은  import안해줘도  된다!!
  // app.module에서 ConfigModule을 글로벌로해서 configService또한 안해줘도됨!
  imports: [TypeOrmModule.forFeature([User])],
  //import를 통해 service에서 repository사용가능하게 했음!
  providers: [UserResolver, UserService],

  //jwtMiddleware에서 쓰기 위해 export해준다!
  exports: [UserService],
})
export class UsersModule {}
