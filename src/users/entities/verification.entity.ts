import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field((type) => String)
  code: string;

  //접근할려는 주체쪽에 JoinColumn을 써야한다.
  //유저가 verification정보로 뭘하고싶으면 user에
  //verification정보로 유저에 접근하고싶으면 verification에 join을!
  //CASCADE를 사용하면 PrimaryKey인 User가 삭제되면 verification code
  //도 자동적으로 삭제될것임!!
  @OneToOne((type) => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  //이게 있어야지 아이디가 만들어짐..왜냐하면 우리가
  //userService에 User는 넘겨줬지만 verification코드는 넘겨주지않았는데
  //여기서 넘겨준다!
  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
