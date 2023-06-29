import jwt, { JwtPayload } from "jsonwebtoken";
export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET,
  options = {
    algorithm: "HS256",
    expiresIn: "1d",
  },
}: {
  payload: string | Buffer | object;
  privateKey?: string;
  options?: jwt.SignOptions;
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        throw reject(err);
      }
      resolve(token as string);
    });
  });
};

export const verifyToken = ({
  token,
  secretOrPublicKey = process.env.JWT_SECRET,
}: {
  token: string;
  secretOrPublicKey?: string;
}) => {
  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) {
        throw reject(err);
      }
      resolve(decoded as JwtPayload);
    });
  });
};
