//오더를 살펴보면 오더ID가 있으면
그 오더아이디에 여러가지 orderitemId가 있고
orderitemId는 각 DishId 및 옵션정보를 가리키고 있다!

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
//readyPotato : potatoId라고 위에서 가져온걸 확인해보자!

    },
    resolve: ({ readyPotato }) =>
      `Your potato with the id ${readyPotato} is ready!`,
      //여기서 mutation의 readyPotato값을 받아 resolve 에서 실행할것임!

})
@Role(['Any'])
readyPotato(@Args('potatoId') potatoId: number) {
return this.pubSub.asyncIterator('hotPotatos');
}
