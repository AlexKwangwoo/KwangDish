import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

//Dynamic 모듈은 다른 모듈을 반환해주는 모듈임
//@Global() 붙여주게되면 다른곳에서 import없이 사용가능!
//appModule에서 privatekey를 받는다..즉 forRoot(options: 값이 된다
//그 option은 provide인 CONFIG_OPTIONS의 값이 된다! service로 넘겨줌!
@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    //forRootPractice하고 appModule에서  JwtModule.forRootPractice
    //여도 되나.. 약속어로 forRoot쓰기로 한거임!!
    return {
      module: JwtModule,
      providers: [
        {
          //usevalue는 provide의 값이다!
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}
