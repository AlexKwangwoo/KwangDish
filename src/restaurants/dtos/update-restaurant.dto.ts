// import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
// import { CreateRestaurantDto } from './create-restaurant.dto';

// //partialType은 ? 와같다.. 필수사항이 아님..있어도되고 없어도됨!
// @InputType()
// class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {}
// //CreateRestaurantDto대신 Restaurant넣어도되는데.. 그렇게되면
// // id가 옵션상황이 되어 버린다.. primary.. (무조껀있어야함)  그래서 DTo로 한다!
// //CreateRestaurantDto 는 ID는 없이 업데이트되는것인데! CreateRestaurantDto
// //를 밑에서 field로 가져오고 ID Field를 따로 받아올것임!

// //어떤 id를 이용해 수정할건지 알려줘야한다!
// @InputType()
// export class UpdateRestaurantDto {
//   @Field((type) => Number)
//   id: number;

//   @Field((type) => UpdateRestaurantInputType)
//   data: UpdateRestaurantInputType;
// }
