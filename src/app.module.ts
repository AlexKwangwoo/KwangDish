import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';

//Appmodule에 graphQl모듈을 추가할것이다!
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      //어디서든 쓸수있따!
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      //파일 어디서 오는지? 환경설정 파일!!
      //package json 의 start:dev에 설정했음!
      //**cross-env 를 불러서 ENV라는 변수를 dev라고 지정함!
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'nuber-eats',
      synchronize: true,
      logging: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    // schema안가지고 있어도 메모리에 자동으로 저장된다!
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
