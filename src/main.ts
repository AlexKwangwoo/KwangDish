import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { jwtMiddleware } from './jwt/jwt.middleware';

//여기가 제일 처음으로 시작되는 곳이다
//AppModule만 import해오지만
//AppMoudle에서 거의 모든 내용을 import하고있다!
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  //위에는 dto의 유효성 검사에 필요한 코드임!!

  app.enableCors(); // 이곳을 통해 프론트엔드 3000에서도 4000(백엔드)
  //기능을 요청할수있음!!!

  //어플리케이션 모든곳에서 미들웨어 사용가능하게함!
  //또는 appmoudle에서 사용하고싶은곳만 접근가능하게 만들수있음!
  //만약 Injection이나 repository쓰면.. appuse는 함수컴포넌트만가능!
  // app.use(jwtMiddleware);
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
