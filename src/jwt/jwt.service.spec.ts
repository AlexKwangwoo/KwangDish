import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'testKey';
const USER_ID = 1;

jest.mock('jsonwebtoken', () => {
  return {
    //sign을쓰면 TOKEN값을 리턴함..jwt.sign (service) 에있는걸로 안감!!
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});

//외부jwt.sign과 같은 기능을 mock하는 법을 배울것이다!

describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sign', () => {
    it('should return a signed token', () => {
      const token = service.sign(USER_ID);
      console.log(token);
      //위에서 sign: jest.fn(() => 'TOKEN'),
      //을통해 컨솔로그를 TOKEN을 가져오지만 위에 목함수 안만들면
      //jwtservice에서 constructor 부분에서 가져오게된다!
      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenLastCalledWith({ id: USER_ID }, TEST_KEY);
    });
  });
  describe('verify', () => {
    it('should return the decoded token', () => {
      const TOKEN = 'TOKEN';
      const decodedToken = service.verify(TOKEN);
      //verfi = TOKEN과 id=1값이 합쳐져서 토큰이 만들어짐
      // 그걸 다시 아이디와 TOKEN을 분리해 decodedToken에 1을 넣음!
      expect(decodedToken).toEqual({ id: USER_ID });
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
    });
  });
});
