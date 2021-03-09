import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  //카테고리에는 한식이면..한식은 여러개의 음식점 어레이가질수있음!!
  // restaurant.category 이 카테고리는 restaurant.entity의 category흰색임!
  //null이여도 된다..그래야 카테고리가 사라져도 레스토랑이 안사라짐!
  //여기는 디비에 컬럼 안나오지만 레스토랑에서는 카테고리 컬럼이 나옴!
  @Field((type) => [Restaurant], { nullable: true }) //그래프큐엘이라 []안에 넣어야함!
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}
