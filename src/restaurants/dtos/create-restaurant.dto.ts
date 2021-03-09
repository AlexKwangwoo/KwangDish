import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

// 이렇게 하면 @Args 안에 이름을 써야한다!
// object를 전달해야한다
// @InputType()
// export class CreateRestaurantDto {
//   @Field((type) => String)
//   name: string;
//   @Field((type) => Boolean)
//   isVegan: boolean;
//   @Field((type) => String)
//   address: string;
//   @Field((type) => String)
//   ownersName: string;
// }

//argstype은 하나하나의 args를 전달할수있다

//************entity에 넣었으면 dto에도 넣어야함!! *******/
//매번 entity를 수정할때마다 dto도 수정하기 까다로울수있음..
// 그래서 base를 만들고 거기에 확장하고 확장한거에서 필요한거만
//자동으로 쓸수잇게 만들어보는게 inputType임!!
//**************************************************** */

// @ArgsType()
// export class CreateRestaurantDto {
//   @Field((type) => String)
//   @IsString()
//   @Length(5, 10)
//   name: string;

//   @Field((type) => Boolean)
//   @IsBoolean()
//   isVegan: boolean;

//   @Field((type) => String)
//   @IsString()
//   address: string;

//   @Field((type) => String)
//   @IsString()
//   ownersName: string;
// }

//즉 OmitType=> Restaurant entity를 가지는데 id만 빼고 다 가져올게요!!
//entity가 수정되면 여기도 수정될것임! 그리고 omitType등 (pickType)들은
//InputType 에서만 작동한다 그래서 entity에 InputType @ 넣어줘야함!
//InputType을 entity에 안써주면 objecttype이 될것이다.. 그럼 적용안됨!
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field((type) => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}

//또는 entity에 @Inputtype안쓰고싶으면
//@InputType()
// export class CreateRestaurantDto extends OmitType(Restaurant, ['id'], InputType,) {}
//이렇게 하면됨!
