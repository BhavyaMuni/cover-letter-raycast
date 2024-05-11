import { OAuthService } from "@raycast/utils";

const clientId =
  "1038477001981-f8k6n1rqom4q37m0o7qmldvoh6sje23j.apps.googleusercontent.com";

export const auth = OAuthService.google({
  clientId,
  scope:
    "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/docs",
});
