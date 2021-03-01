import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

//pickType을 이용해 User의 email과 password를 뽑아내고
//partialType을 이용해 email과 password 둘중 하나를 하던 아예안하던
// 하게 해준다..
@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}
