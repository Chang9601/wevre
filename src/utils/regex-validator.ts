export const REGEX_VALIDATOR = {
  NAME: /^[가-힣]{3,}$/,
  EMAIL: /^[\w.+-]+@[\w-]+\.[\w.-]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/,
  PHONE_NUMBER: /^([0-9]{3})[-]([0-9]{4})[-][0-9]{4}$/,
  NUMBER: /^[1-9]\d*$/,
};
