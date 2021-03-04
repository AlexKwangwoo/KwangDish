import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from 'src/common/entities/core.entity';
//Jest는 이방식이 사용 어렵다!! 'src/common/entities/core.entity';
//그래서 경로 수정을 해줘야한다!
// "moduleNameMapper": {
//   "^src/(.*)$": "<rootDir>/$1"
// },
//json에서 jest의 위에걸 통해서 수정가능하다
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

  //beforeUpdate에 의해 verfication 이메일할때
  //hash되어있는 비밀번호가 한번더 hash된다!! 이걸막기위해
  //password가 직접 업데이트 되지않을때는 그냥 나둔다!!
  // @Column()
  @Column({ select: false })
  @Field((type) => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field((type) => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field((type) => Boolean)
  verified: boolean;

  //데이터베이스에 (insert와update)저장되기전에 무조껀 실행되는함수!!!
  //hash하기 위해 bcrypt사용할 것임!!
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      //패스워드가 포함될때만 해쉬할것이다!!
      try {
        //비밀번호를 바꿀것임!!못알아보게!! 10번의 round를 걸쳐 바꿀것임!
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
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
