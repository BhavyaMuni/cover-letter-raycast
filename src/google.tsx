import { OAuth } from "@raycast/api";
import fetch from "node-fetch";
import { Values } from "./index";
import fs from "fs";

// Create an OAuth client ID via https://console.developers.google.com/apis/credentials
// As application type choose "iOS" (required for PKCE)
// As Bundle ID enter: com.raycast
const clientId =
  "1038477001981-f8k6n1rqom4q37m0o7qmldvoh6sje23j.apps.googleusercontent.com";

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.AppURI,
  providerName: "Google",
  providerIcon: "google-logo.png",
  providerId: "google",
  description: "Connect your Google account\n(Raycast Extension Demo)",
});

// Authorization
export async function authorize(): Promise<void> {
  const tokenSet = await client.getTokens();
  if (tokenSet?.accessToken) {
    if (tokenSet.refreshToken && tokenSet.isExpired()) {
      await client.setTokens(await refreshTokens(tokenSet.refreshToken));
    }
    return;
  }

  const authRequest = await client.authorizationRequest({
    endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: clientId,
    scope:
      "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/docs",
    extraParameters: { access_type: "offline" },
  });

  const { authorizationCode } = await client.authorize(authRequest);
  await client.setTokens(await fetchTokens(authRequest, authorizationCode));
}

async function fetchTokens(
  authRequest: OAuth.AuthorizationRequest,
  authCode: string
): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("code", authCode);
  params.append("verifier", authRequest.codeVerifier);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", authRequest.redirectURI);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: params,
  });
  if (!response.ok) {
    console.error("fetch tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  return (await response.json()) as OAuth.TokenResponse;
}

async function refreshTokens(
  refreshToken: string
): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  //   params.append("client_secret", clientSecret);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: params,
  });
  if (!response.ok) {
    console.error("refresh tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  const tokenResponse = (await response.json()) as OAuth.TokenResponse;
  tokenResponse.refresh_token = tokenResponse.refresh_token ?? refreshToken;
  return tokenResponse;
}

export async function fetchItems(): Promise<{ id: string; title: string }[]> {
  const params = new URLSearchParams();
  params.append("q", "name contains '_Bhavya_Muni_cover_letter'");

  params.append("fields", "files(id, name)");

  params.append("orderBy", "recency desc");
  params.append("pageSize", "100");
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files?" + params.toString(),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
      },
    }
  );
  if (!response.ok) {
    console.error("fetch items error:", await response.text());
    throw new Error(response.statusText);
  }
  const json = (await response.json()) as {
    files: { id: string; name: string }[];
  };
  return json.files.map((item) => ({ id: item.id, title: item.name }));
}

export async function removeTokens(): Promise<void> {
  await client.removeTokens();
}

async function getMasterId(): Promise<string> {
  const params = new URLSearchParams();
  params.append("q", "name = 'cover_letter_bhavya_muni_'");

  params.append("fields", "files(id, name)");

  params.append("orderBy", "recency desc");
  params.append("pageSize", "1");
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files?" + params.toString(),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
      },
    }
  );

  const json = (await response.json()) as {
    files: { id: string; name: string }[];
  };
  const masterId = json.files[0].id;
  return masterId;
}

async function duplicateMaster(cname?: string) {
  const masterId = await getMasterId();
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${masterId}/copy`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
      },
      body: JSON.stringify({
        name: cname + "_Bhavya_Muni_cover_letter",
      }),
    }
  );
  const json = (await response.json()) as { id: string; name: string };
  return json;
}

const formatQualities = (qs: string[]): string => {
  let first = qs.join(", ").replace(/['()]/g, "");

  let reversed = first.split("").reverse().join("");
  let replaced = reversed.replace(",", "dna ");
  return replaced.split("").reverse().join("");
};

async function downloadAsPdf(
  fileId: { id: string; name: string },
  cname?: string
) {
  // download file id as pdf
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId.id}/export?` +
      new URLSearchParams({ mimeType: "application/pdf" }).toString(),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
      },
    }
  );
  response.body?.pipe(
    fs.createWriteStream(
      `/Users/bhavya/Documents/CoOp/${cname ?? ""}_Bhavya_Muni_cover_letter.pdf`
    )
  );
}

export async function generateLetter(values: Values) {
  const fileId = await duplicateMaster(values.company.replaceAll(" ", "_"));

  const reponse = await fetch(
    `https://docs.googleapis.com/v1/documents/${fileId.id}:batchUpdate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
      },
      body: JSON.stringify({
        requests: [
          {
            replaceAllText: {
              containsText: {
                text: "{{DATE}}",
                matchCase: true,
              },
              replaceText: new Date().toLocaleDateString("en-us", {
                day: "2-digit",
                year: "numeric",
                month: "long",
              }),
            },
          },
          {
            replaceAllText: {
              containsText: {
                text: "{{POSITION}}",
                matchCase: true,
              },
              replaceText: values.position,
            },
          },
          {
            replaceAllText: {
              containsText: {
                text: "{{COMPANY}}",
                matchCase: true,
              },
              replaceText: values.company,
            },
          },
          {
            replaceAllText: {
              containsText: {
                text: "{{QUALITY}}",
                matchCase: true,
              },
              replaceText: formatQualities(values.quality),
            },
          },
          {
            replaceAllText: {
              containsText: {
                text: "{{TECH}}",
                matchCase: true,
              },
              replaceText: values.tech,
            },
          },
          {
            replaceAllText: {
              containsText: {
                text: "{{FIELD}}",
                matchCase: true,
              },
              replaceText: values.field,
            },
          },
        ],
      }),
    }
  );
  await downloadAsPdf(fileId, values.company.replaceAll(" ", "_"));
}
