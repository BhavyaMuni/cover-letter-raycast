import fetch from "node-fetch";
import fs from "fs";
import { getAccessToken } from "@raycast/utils";
import { Values } from "./GenerateForm";

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
        Authorization: `Bearer ${getAccessToken().token}`,
      },
    },
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
        Authorization: `Bearer ${getAccessToken().token}`,
      },
    },
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
        Authorization: `Bearer ${getAccessToken().token}`,
      },
      body: JSON.stringify({
        name: cname + "_Bhavya_Muni_cover_letter",
      }),
    },
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
  cname?: string,
) {
  // download file id as pdf
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId.id}/export?` +
      new URLSearchParams({ mimeType: "application/pdf" }).toString(),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAccessToken().token}`,
      },
    },
  );
  response.body?.pipe(
    fs.createWriteStream(
      `/Users/bhavya/Documents/CoOp/${
        cname ?? ""
      }_Bhavya_Muni_cover_letter.pdf`,
    ),
  );
}

export async function generateLetter(values: Values) {
  const fileId = await duplicateMaster(values.company.replaceAll(" ", "_"));

  await fetch(
    `https://docs.googleapis.com/v1/documents/${fileId.id}:batchUpdate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken().token}`,
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
    },
  );
  await downloadAsPdf(fileId, values.company.replaceAll(" ", "_"));
}
