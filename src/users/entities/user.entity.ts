import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from 'src/common/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum } from 'class-validator';

//여기는 DB를 위한곳
enum UserRole {
  Client,
  Owner,
  Delivery,
}

//여기는 그래프ql을 위한곳!!
//name은 그래프큐엘에 적용될이름!
registerEnumType(UserRole, { name: 'UserRole' });

//isAbstract true -> 확장을 가능하게 해줌!!!!
//We don't want to create an InputType
//with ALL the properties of the entity,
//that's why we make it 'abstract'(즉확장만해줌!!중복막기!)
@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field((type) => String)
  @IsEmail()
  email: string;

  @Column()
  @Field((type) => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field((type) => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  //데이터베이스에 (insert와update)저장되기전에 무조껀 실행되는함수!!!
  //hash하기 위해 bcrypt사용할 것임!!
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      //비밀번호를 바꿀것임!!못알아보게!! 10번의 round를 걸쳐 바꿀것임!
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
