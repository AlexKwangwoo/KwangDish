import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    //context는 http로 되어있다!! 이걸 grqphql로 바꿔줘야한다!
    //그래프큐엘은 다르기때문에 알아못먹는다! guard랑 비슷하다!
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    // console.log('user', user);
    return user;
  },
);
