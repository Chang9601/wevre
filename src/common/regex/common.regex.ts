export const ValidationRegex = {
  NAME: /^[가-힣]{3,}$/,
  EMAIL: /^[\w.+-]+@[\w-]+\.[\w.-]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/,
  PHONE_NUMBER: /^([0-9]{3})[-]([0-9]{4})[-][0-9]{4}$/,
  NUMBER: /^[1-9]\d*$/,
  STREET_ADDRESS:
    /^([\p{Script=Hangul}\s\d]){1,}(?:([\p{Script=Hangul}\s\d])+([\p{Script=Hangul}\d])){2,}([\p{Script=Hangul}\s\d])*$/u,
  ADDRESS:
    /^([\p{Script=Hangul}\s\d]){1,}(?:([\p{Script=Hangul}\s\d])+([\p{Script=Hangul}\d])){2,}([\p{Script=Hangul}\s\d])*$/u,
  ZIPCODE: /^[0-9]{5}$/,
};
