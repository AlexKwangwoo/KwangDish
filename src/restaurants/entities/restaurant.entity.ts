import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Category } from './category.entity';

//entities는 오브젝트 개념의 리턴타입을 말해준다!
// @ObjectType() 이건 그래프큐엘을 위한것
// @Entity() 이건 typeorm 디비를 위한것!!
// Entity란 디비에 저장되는 방식!
// InputType 데코레이터(@)를 통해 dto에서 자동으로 같이 업데이트
//되게 만듬.. 그다음 resolver 에
//  @Args('input') createRestaurantDto: CreateRestaurantDto <- input 을 넣어야함!
// isAbstarct:ture해야 적용이됨!(확장시킨다고 보면됨!)

//RestaurantInputType 을 적어줌으로써 InputType과 objectType의 이름같은걸
//막아야한다.. grqphql schema에는 한번만 정의되는데 이름을 안써주면
//중복정의가 되기때문이다!
@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;
  //이곳이 플레이그라운드에 타입으로 나옴!

  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string;

  // @Field((type) => Boolean, { nullable: true })
  // @Column({ default: true })
  // @IsOptional()
  // @IsBoolean()
  // isVegan: boolean;
  //isOptional을 쓰면 값을 안줘도 자동으로 true 대입한다!
  //@Field((type) => Boolean, { defaultValue: true })
  // @Column({ default: true })
  //field는 그래프큐엘을위한.. column은 디비를 위한 디폴트값임!!
  //nullable도 쓸수있으나.. 이거는 아예값이 안들어가는거고
  //defaultValue는 지정된값이.. 안쓰면 자동으로 넣어준다!

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  //한식은 한개의 카테고리 한식을 가질수있음!category: Category;
  //category.restaurants 레스토랑 누르면 카테고리로 간다!
  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category.restaurants, {
    //onDelete: 'SET NULL', null이여도 된다..
    //그래야 카테고리가 사라져도 레스토랑이 안사라짐!
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.restaurants, {
    onDelete: 'CASCADE',
    //유저가 삭제되면 레스토랑도 삭제될것이다!
  })
  owner: User;

  //RelationId 는 밑의 친구가 가리키는것의 ID를 가져온다!
  //restaurant.owner는 밑의 친구를 가리킨다!
  // @Field((type) => User)
  // @ManyToOne((type) => User, (user) => user.restaurants, {
  //   onDelete: 'CASCADE',
  //   //유저가 삭제되면 레스토랑도 삭제될것이다!
  // })
  // owner: User;
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  // @Field((type) => String)
  // @Column()
  // @IsString()
  // ownersName: string;

  // //column을 붙여주면서 디비에 테이블컬럼을 추가함!!
  // //필드는 그래프큐엘을 위한것!
  // @Field((type) => String)
  // @Column()
  // @IsString()
  // categoryName: string;
}
