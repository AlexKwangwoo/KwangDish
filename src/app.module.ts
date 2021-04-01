import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
// import { JwtMiddleware } from './jwt/jwt.middleware';
//1.......................(4번까지)요세개 활성화 해줘야함!!
// import { PaymentsModule } from './payments/payments.module';
// import { Payment } from './payments/entities/payment.entity';
// import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CommonModule } from './common/common.module';
import { UploadsModule } from './uploads/uploads.module';

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
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      //production환경일때는 configModule이 환경변수 파일을 무시할것임!

      //envFilePath를 설정했기에.. 거기서 유효성 검사를 하는것임!!!
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'production', 'test').required(),
        //어느 모드의 env인지 체크!
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
        // AWS_KEY: Joi.string().required(),
        // AWS_SECRET: Joi.string().required(),
      }),
    }),
    //testtest
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
      synchronize: process.env.NODE_ENV !== 'production',
      //이걸 true로 하면 알아서 DB와 typeorm을 자동으로 동기화한다!
      // 즉 prod모드일때는 내가 설정한다!
      logging:
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test',
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        //..............................4여기도 활성화해줘야함
        // Payment,
      ],
      ssl: { rejectUnauthorized: false },
      // entities: [Restaurant],
      //여기에 의해서 Restaurant가 DB가 되는것임!!
    }),
    //dynamic모듈은 설정을 할수있는 모듈이고
    //static모듈은 설정없는 그대로의 모듈이다!!
    GraphQLModule.forRoot({
      //이걸통해서 서버가 웹소켓기능을가져서 실시간기능 가능!!
      //웹소켓에는 request가 없다! 밑의 req undefined가 나올것임
      //http(mutation query)는 문제없이 잘나올것임!!
      //http는 request가 있고!! websocket에는 request가 없다!!
      //대신 connection이 있다!
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      context: ({ req, connection }) => {
        // console.log('결과는!!!!!!!!!!!!!!!!!!!req', req);

        const TOKEN_KEY = 'x-jwt';
        const TOKEN_KEYSK = 'X-JWT';
        return {
          //req가 있으면 header에서 token값의 value를 가져오고
          //connection이있으면 context(안에 x-jwt가 잇음 jwt.sign이 넣어줌)
          //여기서 가져옴!
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEYSK],
        };
        // if (req) { ---------------중요!!!-----------------------
        //req면 user를 줄것이고!! 매번 토큰을 보낼것임!!
        // return { user: req['user'] }; ==> AuthGuard에 쓰임!
        // } else {
        //아니면 connection을.. 웹소캣은 연결할때 딱한번
        //토큰을 보내게 된다 그래서 많은 이벤트를 받고 보내고 다시 토큰
        //보낼 필요가 없다!
        // console.log(connection);
        // }
      },
      //jwt미들웨어에서 받은 토큰해석 user정보를 모든 resolver에서 공유할것임
    }),
    //Schema First말고 codeFirst쓰는데..
    //GraphQLModule 여기서 resolver와 query 을 요청해서 우리가
    //resolver파일은 만든것임!!
    // schema안가지고 있어도 메모리에 자동으로 저장된다!
    // RestaurantsModule,

    //2.....................여기도 활성화해줘야함!~!!
    // ScheduleModule.forRoot(),

    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
      //여기서 jwtInterface에 값을 전달하고 jwtInterface가 jwtmodule에 쓰이고
      //service sign에도 쓰이게됨!!
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),

    //이밑에친구들은 static모듈임!!!!
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
    //3.....................여기도 활성화해줘야함!~!!
    // PaymentsModule,

    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

//실시간을 하기위해서는 미들웨어를 지워야함.. http에서 req를받아 미들웨어 들어가는데
// 실시간은 웹소켓을 쓰기에 웹소켓은 달라서 Guard가 작동이 안됨!! 미들웨어도!!
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     //그래프큐엘의 모든post 메소드를 실행할때 미들웨어를 거쳐갈것임!!!
//     consumer
//       .apply(JwtMiddleware)
//       .forRoutes({ path: '/graphql', method: RequestMethod.POST });
//   }
// }
//여기 안에 미들웨어 설정가능! 여기서는 main과 다르게 consumer이용해!
// 어디에서만 쓸지 정할수도 있음! JwtMiddleware를 쓸껀데
// 모든 graphql에 쓸것이고 모든메소드
//이용가능하게할것임!(post만 가능 이렇게도됨)
