// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
// import { User } from 'src/users/entities/user.entity';
// import {
//   CreatePaymentInput,
//   CreatePaymentOuput,
// } from './dtos/create-payment.dto';
// import { Payment } from './entities/payment.entity';
// import { GetPaymentsOutput } from './dtos/get-payments.dto';
// import { Cron, Interval } from '@nestjs/schedule';
// import { LessThan, Repository } from 'typeorm';

// @Injectable()
// export class PaymentService {
//   constructor(
//     @InjectRepository(Payment)
//     private readonly payments: Repository<Payment>,
//     @InjectRepository(Restaurant)
//     private readonly restaurants: Repository<Restaurant>, // private schedulerRegistry: SchedulerRegistry,
//   ) {}

//   async createPayment(
//     owner: User,
//     { transactionId, restaurantId }: CreatePaymentInput,
//   ): Promise<CreatePaymentOuput> {
//     try {
//       //결제할 레스토랑을 먼저 찾자!
//       const restaurant = await this.restaurants.findOne(restaurantId);
//       if (!restaurant) {
//         return {
//           ok: false,
//           error: 'Restaurant not found.',
//         };
//       }
//       if (restaurant.ownerId !== owner.id) {
//         return {
//           ok: false,
//           error: 'You are not allowed to do this.',
//         };
//       }
//       await this.payments.save(
//         this.payments.create({
//           transactionId: transactionId,
//           user: owner,
//           restaurant: restaurant,
//         }),
//       );
//       //프로모션 결제를 하게되면 그시간이후 7일 프로모트가됨!
//       restaurant.isPromoted = true;
//       const date = new Date();
//       date.setDate(date.getDate() + 7);
//       //언제까지??를 7일더해서 저장할것임!
//       restaurant.promotedUntil = date;
//       this.restaurants.save(restaurant);
//       return {
//         ok: true,
//       };
//     } catch {
//       return { ok: false, error: 'Could not create payment.' };
//     }
//   }

//   async getPayments(user: User): Promise<GetPaymentsOutput> {
//     try {
//       const payments = await this.payments.find({ user: user });
//       return {
//         ok: true,
//         payments,
//       };
//     } catch {
//       return {
//         ok: false,
//         error: 'Could not load payments.',
//       };
//     }
//   }

//   //프로모트 사용기간이 끝났는지 체크할것임!
//   @Interval(5000)
//   async checkPromotedRestaurants() {
//     const restaurants = await this.restaurants.find({
//       isPromoted: true,
//       promotedUntil: LessThan(new Date()),
//       //체크하는 날짜보다 작으면! false로 바꿔버리겠음!
//     });
//     // console.log(restaurants);
//     //모든 레스토랑 검색해봄!
//     restaurants.forEach(async (restaurant) => {
//       restaurant.isPromoted = false;
//       restaurant.promotedUntil = null;
//       await this.restaurants.save(restaurant);
//     });
//   }
// }
// //--------------cron 공부!!!----------------------------------
// //* * * * * * 각숫자는 초 분 시간 날짜 달 주 이렇게 된다!
// //매 시간 30초마다 실행해주세요! */3 3분간격으로 실행 /// * 3 매시간 3분!
// // @Cron('30 * * * * *', {
// //   //10시10분30초에 실행 11분30초에실행
// //   name: 'myJob',
// // })
// // checkForPayments() {
// //   console.log('Checking for payments....(cron)');
// //   const job = this.schedulerRegistry.getCronJob('myJob');
// //   job.stop();
// // }

// // @Interval(5000) //이친구는 내가 실행한시간 기준으로 5초마다 실행!
// // checkForPaymentsI() {
// //   console.log('Checking for payments....(interval)');
// // }

// // @Timeout(20000) // 이것은 1번만 실행된다!
// // afterStarts() {
// //   console.log('Congrats!');
// // }
