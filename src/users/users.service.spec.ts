import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';
//userService에서 레퍼지토리를 이용하기에
//테스트를 위해서는 여기도 레퍼지토리가 필요하다!!
//Mock이용할것이다.. 이것은 가짜함수의 실행이다!!
// 그래서 TypeORM에서 진짜 유저 레퍼지토리를 불러오지 않을것임!
// @InjectRepository(User) private readonly users: Repository<User>,
// @InjectRepository(Verification)
// private readonly verifications: Repository<Verification>,
// private readonly jwtService: JwtService,
// private readonly mailService: MailService,
//위의 친구들을 가짜함수를 사용해 불러올것이다 진짜로 불러오면
//그건 하나하나의 테스트가 아니다!!

//이렇게 () => 함수로 밑에 만들어줘야 verification의 create와
//user create가 2번 연속 안불렸다고 할것임!
const mockRepository = () => ({
  //User Service 에서 레퍼지토리함수(findOne, Create)같은게
  //밑의 3종류를쓴다 가짜를 만들어줄것임!
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = {
  //jwt 는 2개를 사용하고있다!
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
//Record는 다른 타입을 다른타입의 집합으로 바꿔준다!
//<keyof Repository<T>(T는 User)  save, create, findOne같은친구들
//을 jest.Mock 타입으로 바꿔준다!
//즉 진짜레퍼지토리를 jestMock을 이용해 가짜레퍼지토리르 만들었다 생각하자!

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it.todo('createAccount');
  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
      role: 0,
    };
    //중복이메일경우!
    it('should fail if user exists', async () => {
      //실패하면 mockResolve value를 리턴한다!
      // const exists = await this.users.findOne({ email });
      // 저기 리턴값을 줄것임!
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });
      //밑에것이(createAccount) 실행되서 움직여야하는데.. 위에것
      //usersRepository.findOne.mockResolvedValue이
      //jest가 이미 findOne값을 가로 체어 const exists에 값을 넣어줬음!
      //exists 하기떄문에 유저가 이미이써서 실패할것임!
      //즉 값을 가로채서 테스트를 하는것임!
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });
    it('should create a new user', async () => {
      //mockResolvedValue이거는 await 일때 사용!!
      //mockReturnValue 이거는 값을 리턴하는것임! (await아닐때!!)
      //Yes it does, because basically mockResolvedValue
      //is for mocking asynchronous code and mostly being
      //use when mocking a module with async code.
      //Otherwise, you can just use `mockReturnValue.

      //만들려는 유저가 없어서 exist 통과 할것임!!
      usersRepository.findOne.mockResolvedValue(undefined);
      //그다음 새 유저를 만들것을 리턴할것임!!
      usersRepository.create.mockReturnValue(createAccountArgs);
      // await service.createAccount(createAccountArgs);

      //mockReturnValue 이거는 값을 리턴하는것임!
      usersRepository.save.mockResolvedValue(createAccountArgs);

      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({
        //위에서 리턴을 mockReturnValue -> email role password만 했기에
        //code를 함께 보내준다!
        code: 'code',
      });

      const result = await service.createAccount(createAccountArgs);

      //이 함수가 1번만 불릴것이라고 기대하는것임!
      expect(usersRepository.create).toHaveBeenCalledTimes(1);

      //createAccountArgs 와 같이 함수가 호출됬다고 기대함!
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      //밑에 두개도 똑같음!
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      //
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });
  });

  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
