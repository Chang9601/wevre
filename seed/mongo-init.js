const ADMIN_USERNAME = 'root';
const ADMIN_PASSWORD = 'root';
const ADMIN_DATABASE = 'admin';
const USERNAME = 'csup';
const PASSWORD = 'csup';
const DATABASE = 'wevre';
const ROLE = 'readWrite';
// 항상 생성되는 admin 데이터베이스로 이동한다.
db = db.getSiblingDB(ADMIN_DATABASE);
// Docker Compose의 MONGO_INITDB_ROOT_USERNAME와 MONGO_INITDB_ROOT_PASSWORD을 사용해서 루트 사용자로 로그인한다.
db.auth(ADMIN_USERNAME, ADMIN_PASSWORD);
// MONGO_INITDB_DATABASE에 적힌 이름으로 데이터베이스를 생성한다.
db = db.getSiblingDB(DATABASE);
// 새로운 사용자를 생성한다.
db.createUser({
  user: USERNAME,
  pwd: PASSWORD,
  roles: [
    {
      role: ROLE,
      db: DATABASE,
    },
  ],
});
