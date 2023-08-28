import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

// BaseExceptionFilter는 이미 동작하는 catch() 메서드를 가진 NestJS에서 만들어진 클래스.
// 상속하여 catch() 메서드에 사용자 정의 논리를 추가할 수 있으며 끝에 super.catch(exception, host)를 호출하여 나머지 처리를 NestJS에 맡긴다.
// NestJS가 오류를 처리하는 방법에 만족하고 오류를 로그에 기록하려면 BaseExceptionFilter를 상속하는 것이 적합하다.
@Catch(WsException, HttpException)
export class WebsocketExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient() as WebSocket;
    const data = host.switchToWs().getData();
    const error =
      exception instanceof WsException
        ? exception.getError()
        : exception.getResponse();
    const details = error instanceof Object ? { ...error } : { message: error };

    client.send(
      JSON.stringify({
        event: 'error',
        data: {
          id: (client as any).id,
          rid: data.rid,
          ...details,
        },
      }),
    );

    super.catch(exception, host);
  }
}
