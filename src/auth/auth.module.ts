import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { UsersModule } from 'src/users/users.module';

//여기서 만든걸 app.module에 추가하여 모든곳에
//Role을 쓸예정! ->모든곳에서 사용가능하다!
//nest는 모든 resolver를 실행하기전에 authGuard를 실행한다!
@Module({
  imports: [UsersModule],
  //UsersModule을가져와줘야 어스친구들에게 유저 제공가능!
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
