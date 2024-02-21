export enum Role {
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export enum OAuthProvider {
  NONE = 'none',
  GOOGLE = 'google',
  NAVER = 'naver',
}

export enum Pagination {
  LIMIT = 10,
  OFFSET = 0,
  SEARCH = '',
  SORT = 'date',
}

export enum Token {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

export enum ValidationError {
  OBJECT_TYPE = '객체만 가능.',
  NUMBER_TYPE = '숫자만 가능.',
  INTEGER_TYPE = '정수만 가능.',
  STRING_TYPE = '문자열만 가능.',
  STRING_LENGTH = '최소 길이는 1자.',
  OBJECT_ID_TYPE = '몽고 아이디만 가능.',
  ARRAY_TYPE = '배열만 가능.',
  ARRAY_SIZE = '비어있지 않은 배열만 가능.',
  OPTION_TYPE = '옵션 객체만 가능.',
  OPTION_ELEMENT = '원소는 문자열만 가능.',
  NAME = '유효하지 않은 이름.',
  STREET_ADDRESS = '유효하지 않은 도로명 주소.',
  ADDRESS = '유효하지 않은 주소.',
  ZIPCODE = '유효하지 않은 우편번호.',
  EMAIL = '유효하지 않은 이메일.',
  PASSWORD = '유효하지 않은 비밀번호.',
  PHONE_NUMBER = '유효하지 않은 전화번호.',
  BIRTHDAY = '유효하지 않은 생년월일.',
  POSITIVE_NUMBER = '양수만 가능.',
  NON_NEGATIVE_NUMBER = '음수가 아닌 수만 가능.',
  CART_ARRAY = '장바구니 객체의 배열만 가능.',
  ITEM_TPYE = '상품 객체만 가능.',
  ITEM_ARRAY = '상품 객체의 배열만 가능.',
}
