import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  //하나이상의 쿼리를 만들어줘야 그래프큐엘이 실행됨
  // @Query((returns) => Boolean)
  // hi() {
  //   return true;
  // }

  //여기서 args를 input으로 쓸꺼기때문에 inputtype을 사용함!!
  //일반적으로는 objecttpye을 사용하면됨! 그래서 output은 오브젝타입임!
  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    //CreateAccountOutput 반환이기에 error와ok를 보냄..error는 nullable true임!
    try {
      // const error = await this.usersService.createAccount(createAccountInput);
      // //성공했으면 return이 없기에 error가 null일것임!!
      // //실패했으면 error에 return값이 올것임!
      // if (error) {
      //   return {
      //     ok: false,
      //     error,
      //   };
      // }
      // return {
      //   ok: true,
      // };
      const { ok, error } = await this.usersService.createAccount(
        createAccountInput,
      );
      return {
        ok,
        error,
      };
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }

  //login.dto에서 email과 password를 input받고
  // token을 output할것임! MutationOuput을 extend 했음으로
  // error와 ok도 같이 갈것이다!
  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      const { ok, error, token } = await this.usersService.login(loginInput);
      return { ok, error, token };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  //appmodule에서 가져온 (jwt미들웨어 user정보를 사용할것임!)
  //UseGuards는 false는 다 막아버림..미들웨어를!!
  //즉로그인 되어있다면 진행할것이고 아니면 멈출것임!
  //그리고 누가 req를 보냈는지 알아야한다! 사기인지 진짜인지..
  //그래서 우리의 decorator(@AuthUser())를 만들어보자!
  //auth-user.decorator에서 return한것이 authUser로 보내질것임!
  //그 타입이 User가 됨!
  @Query((returns) => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @UseGuards(AuthGuard)
  @Query((returns) => UserProfileOutput)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findById(userProfileInput.userId);
      if (!user) {
        throw Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (e) {
      return {
        error: 'User Not Found',
        ok: false,
      };
    }
  }

  //@UseGuards 를 쓰는순간 로그인안해있으면 그 밑줄 코드
  //실행 불가능... 이유는 토큰을 모르기떄문!
  @UseGuards(AuthGuard)
  @Mutation((returns) => EditProfileOutput)
  async editProfile(
    //AuthUser현재 유저에 대한정보를 준다!
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this.usersService.editProfile(authUser.id, editProfileInput);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Mutation((returns) => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    try {
      await this.usersService.verifyEmail(code);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
