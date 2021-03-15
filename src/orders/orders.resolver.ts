import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import {
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
  PUB_SUB,
  NEW_ORDER_UPDATE,
} from 'src/common/common.constants';
import { Inject } from '@nestjs/common';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';

//publish and subscription 실시간!!
//전체적으로 작동을 해야하기에 여기말고 다른곳에 실시간할려면??
// const pubsub = new PubSub();

@Resolver((of) => Order)
export class OrderResolver {
  constructor(
    private readonly ordersService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation((returns) => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input')
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.crateOrder(customer, createOrderInput);
  }

  @Query((returns) => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrderInput);
  }

  @Mutation((returns) => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, editOrderInput);
  }

  @Subscription((returns) => Order, {
    //args생략하고싶을땐 _ 적자!
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      return ownerId === user.id;
    },
    //mutation에서 받아온 내용을 리졸버내용으로 바꿀것임!!
    resolve: ({ pendingOrders: { order } }) => order,
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription((returns) => Order)
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription((returns) => Order, {
    filter: (
      //order 불린 orderUpdates 의 타입이 !! =>
      //{ orderUpdates: Order }, 정해주는것이다!
      { orderUpdates: order }: { orderUpdates: Order },
      //orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
      //여기서 input을 수정할 오더아이디를 받는다!
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === input.id;
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation((returns) => TakeOrderOutput)
  @Role(['Delivery'])
  takeOrder(
    @AuthUser() driver: User,
    @Args('input') takeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    return this.ordersService.takeOrder(driver, takeOrderInput);
  }

  //-------------------------Practice--------------------------------

  @Mutation((returns) => Boolean)
  async potatoReady(@Args('potatoId') potatoId: number) {
    await this.pubSub.publish('hotPotatos', {
      //(hotPotatos) 1번을 발생시키고
      readyPotato: potatoId,
      //(readyPotato) 2번발생동시 내용만들기!
    });
    return true;
  }

  //Mutation과 Query는 Http가 필요하고 subscription은 ws
  //웹소캣이 필요하다->실시간을 위해서!
  //즉 이친구는 Mutation potatoReady가 발생할때마다 뮤테이션에
  //정의된 readyPotato의 내용을 발생시킨다!
  @Subscription((returns) => String, {
    filter: ({ readyPotato }, { potatoId }) => {
      //filter:(payload,variables,context) -> 안에값 다 쓸수있음!
      //filter은 첫번째 인자로 payload(실행시킬함수 2번를 받고!)
      //두번재인자로는 변수를 받으며 세번재는 context(글로벌)을 받는다!
      //filter를 해줘야하는 이유는 모든 update를 알필요는 없음!
      //필터는 true or false 리턴하게 해야함!
      return readyPotato === potatoId;
    },
    //리졸브는 update알림의 형태를 바꿔줌!!
    //결국은 resolve가 중요하다!
    resolve: ({ readyPotato }) =>
      `Your potato with the id ${readyPotato} is ready!`,
    //여기서 mutation의 readyPotato값을 받아 resolve 에서 실행할것임!
  })
  @Role(['Any'])
  readyPotato(@Args('potatoId') potatoId: number) {
    return this.pubSub.asyncIterator('hotPotatos');
  }
  // readyPotato(@AuthUser() user: User) {
  //   console.log(user);
  //   //==== readyPotato 2번
  //   return this.pubSub.asyncIterator('hotPotatos');
  //   //==== hotPotatos 1번
  //   //
  // }
}
