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
import { PUB_SUB } from 'src/common/common.constants';
import { Inject } from '@nestjs/common';

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
