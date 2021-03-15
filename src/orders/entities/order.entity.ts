import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { IsEnum, IsNumber } from 'class-validator';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

//-------------고객이 주문한건 user.order이고
//-------------드라이버가 가진 order는 user.rides이다!

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  //customer가 지워져도 order는 지워지지 않는다!
  //customer가 null되도된다!
  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  //주문을하면 그주문은 배정된 driver가 없다!
  //driver를 지워도 order는 지워지지 않는다!
  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field((type) => Restaurant, { nullable: true })
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  restaurant?: Restaurant;

  //하나의 음식은 많은 주문을 받을수있고
  //하나의 주문은 많은 음식들을 받을수있다!
  //manytomany 에서는 @JoinTable()을 써줘야 연결되는데
  //소유하고 있는 쪽의 relation에 추가하면된다!
  //하나의 음식은 어디의 주문으로 가는지 볼수없지만 (알필요없다!)
  //하나의 주문은 어떤 음식을 가지고 있는지 볼수있다.
  //그래서 여기에 joinTable()이 order entity에 들어가야한다!
  //***********DishOption 을 저장할수없어(json이라..)
  //dish[]에서 items로 전격바꿈!!
  @Field((type) => [OrderItem])
  @ManyToMany((type) => OrderItem, { eager: true })
  @JoinTable()
  items: OrderItem[]; //하나의 주문은 많은 음식을 가질것임!

  //총 가격이될것임!
  @Column({ nullable: true })
  @Field((type) => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field((type) => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
