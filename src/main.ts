import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//여기가 제일 처음으로 시작되는 곳이다
//AppModule만 import해오지만
//AppMoudle에서 거의 모든 내용을 import하고있다!
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  //위에는 dto의 유효성 검사에 필요한 코드임!!

  await app.listen(3000);
}
bootstrap();
