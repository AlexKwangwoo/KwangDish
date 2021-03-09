import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

//여기서 만든걸 app.module에 추가하여 모든곳에
//Role을 쓸예정! ->모든곳에서 사용가능하다!
//nest는 모든 resolver를 실행하기전에 authGuard를 실행한다!
//CanActivate 는 true를 return하면 request를 진행시키고 false면 멈춤
//auth.module에서부터 정의해서 여길쓴다고 했음!@!!!!@!@!@!@@@@@@@@@@@
//this.reflector.get<AllowedRoles> 여기서 role.decorator를 적용시킨다!
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      //export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
      //role.decorator에서 가져온것이다!!('roles')
      context.getHandler(),
    );
    console.log(roles);
    //***********중요!!!!*******/
    //모든 resolver에서 @Role(['Owner'])과 같은걸 명시 하지않으면
    //roles는 undefined로 나온다.. 즉 모든사람이 이용가능하다는뜻
    // 하지만 createRestaurant같은경우는 @Role이 owner이기에
    //오너의 경우에만 이용가능하게 된다!
    if (!roles) {
      //roles가 없다는건 @Role이 없다는뜻!! 로그인없이 모든유저 사용가능!
      //아이디 만드는게 여기에 해당된다~!
      return true;
    }
    //context는 http로 되어있다!! 이걸 grqphql로 바꿔줘야한다!
    //그래프큐엘은 다르기때문에 알아못먹는다!
    //ExecutionContext(nestJS의)이것이 context의 req를 받아온다!!
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    //jwt미들웨어 에서 req에 user를 넣어줬다!
    if (!user) {
      return false;
    }
    if (roles.includes('Any')) {
      return true;
    }
    //만약 내가 레스토랑create하면 owner가 roles에 있다(그말은
    //createRestaurant에 @Role(['Owner']))이라는뜻! Owner를 요구!!!
    //그래프큐엘에서 user(로그인된)를 들고오고..그 user의 role이 owner라면
    //리턴을 true아니면 false를 할것임!
    return roles.includes(user.role);
  }
}
