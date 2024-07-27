import { JwtFromRequestFunction } from 'passport-jwt';

const fromWsAuthHeaderAsBearerToken = (
  headerName: string = 'authorization',
): JwtFromRequestFunction<Request> => {
  return (req) => {
    return req.headers[headerName];
  };
};

export const ExtractWsJwt = {
  fromWsAuthHeaderAsBearerToken,
};
