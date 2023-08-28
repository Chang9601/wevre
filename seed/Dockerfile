FROM mongo:6.0.7

WORKDIR /opt/bson
# 대상은 원본이 대상 컨테이너 내부의 어느 위치로 복사될지를 나타내는 절대 경로 또는 WORKDIR을 기준으로 한 상대 경로이다.
# 절대 경로: /절대 경로/
# 상대 경로: <WORKDIR>/상대 경로/
# 원본이 디렉터리인 경우, 해당 디렉토리 전체 내용이 파일 시스템 메타데이터와 함께 복사되지만 디렉터리 자체는 복사되지 않는다.
COPY bson/ ./

WORKDIR /opt/script
# 원본 경로는 반드시 빌드 컨텍스트 내에 있어야 하는데 빌더는 컨텍스트에서만 파일에 접근할 수 있으며 ../은 빌드 컨텍스트 루트의 상위 파일 또는 디렉터리를 지정하기 때문이다.
COPY seed.sh .

RUN chmod +x seed.sh

CMD ["sh", "-c", "/opt/script/seed.sh"]