# Wevre

## 소개
- WebSocket 프로토콜을 사용하여 실시간 경매방을 구현한 위코드 2차 프로젝트 Wevre를 HTTP 폴링을 포함한 SocketIO 라이브러리로 리팩토링하고 있습니다.
- 개발 시 SocketIO 라이브러리의 HTTP 폴링으로 실시간 경매방을 구현했으며 배포 시 스케일 아웃을 염두해 스티키 세션과 어탭터를 구현하고 있습니다.
- 또한 관계형 데이터베이스인 MySQL을 사용한 Wevre와 달리 리팩토링에서는 NoSQL 데이터베이스 MongoDB를 사용해서 NoSQL 데이터베이스의 특징과 쿼리를 체득하고 있습니다.

## 실행
main 브랜치의 docker-compose.yml 파일을 docker compose up --build 명령으로 실행.
-  애플리케이션: http://localhost:3000, http://localhost:3001
-  Redis 웹 인터페이스: http://localhost:8081
-  MongoDB 웹 인터페이스: http://localhost:8082

## 기술 스택
|개발|
| :----: |
|![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)|

## API
애플리케이션 실행 후 http://localhost:3000/api

## 기록
https://whooa27.blogspot.com/search/label/wevre

## 시현
### 회원가입, 로그인 및 개인정보
[Screencast from 2024년 01월 29일 09시 36분 36초.webm](https://github.com/Chang9601/wevre/assets/79137839/fa34822e-0820-497e-84d4-a584640714af)

### 작품 목록, 작품 상세 및 경매방
[Screencast from 2024년 01월 29일 17시 28분 16초.webm](https://github.com/Chang9601/wevre/assets/79137839/d8b12442-96e5-4800-a71c-ec06e4cd53f9)

### 입찰:2개의 경매방(각각 2명)
[Screencast from 2024년 01월 29일 11시 58분 34초.webm](https://github.com/Chang9601/wevre/assets/79137839/171a326c-4443-4ebe-a632-72317bb8cb2b)

### 입찰: 1개의 경매방(4명)
[Screencast from 2024년 01월 29일 12시 00분 18초.webm](https://github.com/Chang9601/wevre/assets/79137839/d87c9165-e36c-438e-9bce-67f2a044586d)

### Redis 어댑터(SocketIO 서버 스케일 아웃)
[Screencast from 2024년 02월 18일 22시 43분 20초.webm](https://github.com/Chang9601/wevre/assets/79137839/aa22715c-dd7f-4c7f-a6c0-cb93119f9e91)

### 낙찰
[Screencast from 2024년 01월 29일 17시 12분 35초.webm](https://github.com/Chang9601/wevre/assets/79137839/8ec9577d-0c94-4c10-a319-9e2e624826bc)

### 주문 및 주문 목록
[Screencast from 2024년 01월 29일 17시 15분 11초.webm](https://github.com/Chang9601/wevre/assets/79137839/fa0530be-637b-40dc-ba90-43c489dc5ff3)

### 로그아웃
[Screencast from 2024년 01월 29일 17시 30분 24초.webm](https://github.com/Chang9601/wevre/assets/79137839/e502688e-1a6e-466f-b189-0cbd02aeeff9)
