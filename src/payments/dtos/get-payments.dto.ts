// import { Field, ObjectType } from '@nestjs/graphql';
// import { CoreOutput } from 'src/common/dtos/output.dto';
// import { Payment } from '../entities/payment.entity';

<<<<<<< HEAD
@ObjectType()
export class GetPaymentsOutput extends CoreOutput {
  @Field((type) => [Payment], { nullable: true })
  payments?: Payment[];
}
=======
// @ObjectType()
// export class GetPaymentsOutput extends CoreOutput {
//   @Field(type => [Payment], { nullable: true })
//   payments?: Payment[];
// }
>>>>>>> 39f8045ec07073402bd21305d073d1242219ec3c
