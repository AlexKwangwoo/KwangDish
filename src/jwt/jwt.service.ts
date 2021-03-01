import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import { CONFIG_OPTIONS } from './jwt.constants';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    //module로 부터 inject할걸 받아오면된다!
    //InjectRepository VS Inject차이는 InjectRepository는 repository기능
    // 다 쓸수있다. ex) findOne, find ...and so on
    //여기는 그냥 프라이머리 키값만 받아올거기때문에 레퍼지토리 필요x
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}
  //sign의 arg로 object를 받을수있으나.. object에 만은걸넣어 다른사람이 역이용가능
  //그래서 userService에서는 userID만 받아와 number로 적용을한것에만 privatekey를
  //사용해서 토큰을 만들어줄꺼임!!
  sign(userId: number): string {
    // console.log('private', this.options.privateKey);
    return jwt.sign({ id: userId }, this.options.privateKey);
  }
  //sign해서 만든 토큰을 가지고 계속 verify해서 이용할것임!
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
