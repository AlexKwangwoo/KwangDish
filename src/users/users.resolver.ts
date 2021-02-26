import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  //하나이상의 쿼리를 만들어줘야 그래프큐엘이 실행됨
  @Query((returns) => Boolean)
  hi() {
    return true;
  }

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
      return this.usersService.createAccount(createAccountInput);
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
      return this.usersService.login(loginInput);
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
