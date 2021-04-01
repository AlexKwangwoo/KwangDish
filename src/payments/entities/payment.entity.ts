// import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
// import { CoreEntity } from 'src/common/entities/core.entity';
// import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
// import { User } from 'src/users/entities/user.entity';
// import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

// @InputType('PaymentInputType', { isAbstract: true })
// @ObjectType()
// @Entity()
// export class Payment extends CoreEntity {
//   @Field((type) => String)
//   @Column()
//   transactionId: string;

//   //한유저가 몇개의 결재를 가지고있는지는 알고싶지만
//   //한 레스토랑이 몇개의 결제를 가지고 있는지는 궁금안함!@!!
//   //그래서 유저와 결제는 서로 관계식을 적지만
//   //결제와 레스토랑에서 결제쪽에만 맨투원 관계를 적어줌!
//   @Field((type) => User)
//   @ManyToOne((type) => User, (user) => user.payments)
//   user: User;

//   @RelationId((payment: Payment) => payment.user)
//   userId: number;

//   //어떤 레스토랑 홍보할건지!!
//   //restaurant쪽은 oneToMAny안해도된다! 구지 할필요없음!
//   //하지만 restaurant가 oneToMany보고싶을떄.. 결재보고싶으면
//   //둘다 해줘야함!
//   @Field((type) => Restaurant)
//   @ManyToOne((type) => Restaurant)
//   restaurant: Restaurant;

//   @Field((type) => Int) //필드 없으면 pickType에서 못가져옴!
//   @RelationId((payment: Payment) => payment.restaurant)
//   restaurantId: number;
// }
