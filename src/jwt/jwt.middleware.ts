import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

//request를 받아서 reponse해줄것임!! 토큰을받아서 분석해 넘길것임!
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      //타입스크립트는 header를 배열이라 생각하기쉬워서 string으로 만들어준다!
      try {
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          // const user = await this.userService.findById(decoded['id']);
          // console.log('middle', user);
          // console.log(user);
          //user에 토큰을 해석해 object로 반환됐음!
          // req['user'] = user;
          //req에 넣어 next에 전달할것임! 또 grqphql에게도줄것임!
          //그걸위해 appmoudle에서 그래프큐엘에서 req를 받아
          //context(req사용가능하게해줌)를이용해 resolver에 공유할것임
          const { user, ok } = await this.userService.findById(decoded['id']);
          if (ok) {
            req['user'] = user;
          }
        }
      } catch (e) {}
    }
    next();
  }
}
