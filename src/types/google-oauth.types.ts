export type TGoogleOAuthConsent = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
};

export type TGoogleUserInfo = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};
