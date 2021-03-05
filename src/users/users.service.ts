import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    //InjectRepository VS Inject차이는 InjectRepository는 repository기능
    // 다 쓸수있다. ex) findOne, find ...and so on
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    //
    //월래는 밑에 두개다 module에서 import에 넣어야하는데
    // private readonly config: ConfigService, 얘는app에서 글로벌 true로
    // private readonly jwtService: JwtService,
    //얘는 jwt파일service에서 //@Global로 만들어줘서 바로 모듈 import없이 사용가능하다!!
    private readonly jwtService: JwtService,
    //MailService 또한 userModule import를 해줘야 쓸수있는데
    //mailModule에서 이미 @global로 선언해서 바로 여기서 쓸수있다!!
    private readonly mailService: MailService,
  ) {
    // this.jwtService.hello();
  }

  //input을 받게될것이다!
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    {
      try {
        const exists = await this.users.findOne({ email });
        if (exists) {
          return {
            ok: false,
            error: 'There is a user with that email already',
          };
        }
        //아이디가 없다면 만들자!
        //..create는..자바스크립트에는 저장하지만 db에는 저장하는게 아님
        //그래서 save해줘야함!! save는 promise를 리턴함!
        //여기서 save되기전에 password가 hash 된다!!
        const user = await this.users.save(
          this.users.create({ email, password, role }),
        );
        const verification = await this.verifications.save(
          this.verifications.create({
            user,
          }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
        return { ok: true };
      } catch (e) {
        //make error
        return { ok: false, error: "Couldn't create account" };
      }
    }
  }

  // async login({
  //   email,
  //   password,
  // }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
  // make a JWT and give it to the user
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      // const user = await this.users.findOne({ email });
      // 패스워드가 이제는 항상 포함이안된다.. verification 더블해쉬 방지때문에
      //그래서 select:false되어있는데.. 우리가 직접 password가 선택돼야 한다고
      //말해줘야한다!
      //findOne은
      //Select id and pasword where email = email이라 생각하면됨
      //그래서 토큰은 id도 필요하기에 id도 뽑아줘야함!

      //**************************** 중요중요   *********************/
      //entity에서 password가 더블 업데이트 되어 column에서 select:false를해줬는데
      //findOne의 의미는 select * where email = email from ~~
      //이였다..(패쓰워드빼고 모든걸 알려줌)
      //그런데 두번째인자 {} select: ['id', 'password'] } 넣어줌으로써
      //Select id and pasword where email = email이 되어 토큰을위한 id제공가능!

      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      console.log("let's See!!!!!!: ", user);
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      //{ select: ['password'] }, 를통해 이제 checkPassword안에
      //this.password를 가질 수 있다!(사용자가 입력할 패스워드임!)
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      //토큰을 만든다!! 두번째인자는
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: "Can't log user in.",
      };
    }
  }
  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      //못찾으면 fail을 리턴 user내용이 없기에 catch로 갈것임!
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }
  // async findById(id: number): Promise<User> {
  //   return this.users.findOne({ id });
  //   //findOne은 typeorm이 제공하는 함수이다!
  // }

  //userId는 @AuthUser() authUser: User, 를통해(토큰) 가져온다!
  // { email, password }: EditProfileInput 이렇게 해줘서 업데이트하면안된다.
  //password를 안바꿀경우 undefined로가게되어 오류발생한다!
  // async editProfile(userId: number, editProfileInput: EditProfileInput) {
  //   // console.log(editProfileInput);
  //   return this.users.update(userId, { ...editProfileInput });
  //
  //
  //*******************update 사용이안됨.. @BeforeUpdate가 작동을안함!!
  //그냥 db에 보내지기만하고 안바뀜....................
  //*******************그래서 save를 사용해서 저장하기로함!!***********/
  //
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        user.email = email;
        user.verified = false;
        //중요!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //로그인에서 이메일이 verfied가 되지 않으면 프로필 수정 불가능하다!!
        //이유는 이미 verification code가 userId와 1:1관계를 맺고 있다
        // 하지만 email수정을하면 다른하나의 verification코드가 이미 1:1관계를
        //맺고있는 userId와 겹치게된다.. 그래서 verified를 통해 이전껄 삭제해줘야한다!!!!!!
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: 'Could not update profile.' };

      //save는 만약 user가 존재하면 업데이트를하고 없으면 create를 한다!
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    //verification의값은 code를 넣어 유저를 찾고!
    //{ relations: ['user'] }, 통해 그유저의 정보를 가져온다!
    //그래서  verification.user가 사용가능함..
    // { relations: ['user'] }, 대신
    // loadRelationIds: true하면 그냥 아이디만 가져온다!!
    try {
      //여기서 verification 에서는 찾은 유저가 들어갈것이다!
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        // console.log(verification.user);
        await this.users.save(verification.user);
        //***********************지우는 방법!!!!*******/
        await this.verifications.delete(verification.id);

        return { ok: true };
      }
      return { ok: false, error: 'Verification not found.' };
    } catch (error) {
      return { ok: false, error: 'Could not verify email.' };
    }
  }
}
