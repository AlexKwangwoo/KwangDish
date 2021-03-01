import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

//여기서 resolver에서 mutation을
//args를 input으로 쓸꺼기때문에 inputtype을 사용함!!
//일반적으로는 objecttpye을 사용하면됨! 그래서 output은 오브젝타입임!
//즉 input은 Args로 입력받을것이고!! output은 성공결과를 알려줄것임!!

//User entity에서 email과 비번과 role만 가져오겠음!
@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

//그래프큐엘 오브젝트타입안에 만들어야함!
@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
