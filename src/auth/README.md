Auth는 우리가 그래프큐엘 mutation 또는 쿼리 또는 실시간(subscription)이
실행 되기전에 권한을 먼저 검사 하게 해주는데..

원리는 맨처음 로그인을 한 시점에서 user서비스의 login가보면
jwt.sign을 불러오는걸 볼수있다 jwt.sign은 로그인한사람의 id(프라이머리키)와
토큰환경변수와 조합되어 토큰이 만들어지게되는데 그걸 header에 보내게 된다

하지만 문제는 mutation과 query까지만 사용할때는 http를 사용하기에 request에
header부분에 토큰을 넣어서 보내면 됐지만 subsciption같은 경우에는
websocket을 이용하기에 http request에 header에서 가져올수가 없다.
websocket을 이용하기위해 app.module에서 graphql.forRoot에 가게되면
context(앱 전체 공용으로 이용되는 전역변수라 생각하자) 에 req와 connection
을 받게 되는데..(websocket은 connection을 보내게되기 때문!!) 그래서
뮤테이션이나 쿼리 또는 실시간을 구분후 실시간일 경우 컨넥션 안의 context안에
토큰을 보내게 된다! 이경우에서 매번 AuthGuard가 쿼리 뮤테이션 실시간 실행전
검사를 하게 되고 검사를 마치고 권한이 되는 유저는 context에 토큰을 통해
가져온 user정보를 context에 넣어주게 된다.

그리고 다른 뮤테이션, 쿼리, 실시간 함수등에서 Guard에서 context에 넣어준 user를
Auth-User 를 통해 user를 뺴와서 모든 함수에 제공을 하게되는것이다. 토큰의 유저가
누굱지!!

10.5강의 참고!!
provide: APP_GUARD,
useClass: AuthGuard,
적어주므로써 AUTH가드가 항상 사용됨! 모든 RESOLVER사용전에!
//nest는 모든 resolver를 실행하기전에 정확하게는
모든 리퀘스트 작업을 할때 app.module에 써주고
auth module에 써주므로써 항상 리퀘스트할때 authGuard를 실행한다!
authGuard는 @Role이 있다면 쿼리에 적힌 롤과 맞는지 확인후 없으면
그냥 authGuard 통과 시키고 @Role이없다면 걍 통과시켜줌

또한 롤이 있다면 분명 아이디를 로그인한 상태이므로
getContext를 얻어와 그래프큐엘로 해석해 토큰을 가져오고
토큰을 decoded해서 jwtService.verify 를 이용해 ID를 가져올것이다
그 아이디를 getContext안에 속성user를 만들고 user를 넣어줄것임
근데 로그인할때 웹소켓이나 req를 통해 토큰을 저장했는데 이게 없다면 forbidden뜰거고
토큰을 가져왔는데 decoded해서 id가 일치하는게 없으면 이또한 forbidden이 뜰것임!

그다음은 이미 context에 (항상@Role이먼저있기에) user가 저장되어있는걸 가져올수있다
