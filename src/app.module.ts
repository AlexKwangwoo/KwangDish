import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';
import * as Joi from 'joi';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';

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
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      //production환경일때는 configModule이 환경변수 파일을 무시할것임!

      //envFilePath를 설정했기에.. 거기서 유효성 검사를 하는것임!
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        //어느 모드의 env인지 체크!
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    //TypeORM decorators are for the DB.
    //GraphQL decorators are for the GraphQL Schema.
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      //string으로 오기때문에 port는 + 붙여서 숫자로 바꿔준다!
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      //이걸 true로 하면 알아서 DB와 typeorm을 자동으로 동기화한다!
      // 즉 prod모드일때는 내가 설정한다!
      logging: true,
      entities: [User],
      // entities: [Restaurant],
      //여기에 의해서 Restaurant가 DB가 되는것임!!
    }),
    //dynamic모듈은 설정을 할수있는 모듈이고
    //static모듈은 설정없는 그대로의 모듈이다!!
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    //Schema First말고 codeFirst쓰는데..
    //GraphQLModule 여기서 resolver와 query 을 요청해서 우리가
    //resolver파일은 만든것임!!
    // schema안가지고 있어도 메모리에 자동으로 저장된다!
    // RestaurantsModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),

    //이밑에친구들은 static모듈임!!
    UsersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
