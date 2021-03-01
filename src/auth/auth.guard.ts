import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

//CanActivate 는 true를 return하면 request를 진행시키고 false면 멈춤
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    //context는 http로 되어있다!! 이걸 grqphql로 바꿔줘야한다!
    //그래프큐엘은 다르기때문에 알아못먹는다!
    //ExecutionContext(nestJS의)이것이 context의 req를 받아온다!!
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    //jwt미들웨어 에서 req에 user를 넣어줬다!
    if (!user) {
      return false;
    }
    return true;
  }
}
