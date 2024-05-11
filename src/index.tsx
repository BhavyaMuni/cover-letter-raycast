import { Action, ActionPanel, List, useNavigation } from "@raycast/api";
import { withAccessToken } from "@raycast/utils";
import fs from "fs";
import { homedir } from "os";
import { useEffect, useState } from "react";
import { auth } from "./oauth";
import { GenerateForm } from "./GenerateForm";

const testFolder = `${homedir()}/Documents/CoOp`;
const fileList = fs
  .readdirSync(testFolder)
  .filter((file) => file.includes("_Bhavya_Muni_cover_letter.pdf"));

function Command() {
  const { push } = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [filteredList, filterList] = useState(fileList);

  useEffect(() => {
    filterList(fileList.filter((file) => file.includes(searchText)));
  }, [searchText]);
  return (
    <List
      filtering={false}
      onSearchTextChange={setSearchText}
      navigationTitle="Cover Letters"
      searchBarPlaceholder="Search past cover letters"
      actions={
        <ActionPanel>
          <Action
            title="Create New..."
            onAction={() => push(<GenerateForm />)}
          />
        </ActionPanel>
      }
    >
      {filteredList.map((file) => (
        <List.Item key={file} title={file} />
      ))}
    </List>
  );
}

export default withAccessToken(auth)(Command);
