export const jwtConstants = {
  secret: process.env.MASTER_PASSWORD_AUTHORYTHY || (Math.random() * 0xFF3344F9).toString(36) + (Math.random() * 0xF07EB0F9).toString(36) + (Math.random() * Math.random() * 0xFF00DD33).toString(36)
};
