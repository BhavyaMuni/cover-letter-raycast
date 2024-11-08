import {
  Action,
  ActionPanel,
  List,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import fs from "fs";
import { homedir } from "os";
import { useEffect, useState } from "react";
import { authorize } from "./oauth";
import { GenerateForm } from "./GenerateForm";

const testFolder = `${homedir()}/Documents/CoOp`;
const fileList = fs
  .readdirSync(testFolder)
  .filter((file) => file.includes("_Bhavya_Muni_cover_letter.pdf"));

const actionsPanel = () => {
  const { push } = useNavigation();
  return (
    <ActionPanel>
      <Action title="Create New..." onAction={() => push(<GenerateForm />)} />
    </ActionPanel>
  );
};

function Command() {
  const [searchText, setSearchText] = useState("");
  const [filteredList, filterList] = useState(fileList);

  useEffect(() => {
    filterList(fileList.filter((file) => file.includes(searchText)));
  }, [searchText]);

  useEffect(() => {
    (async () => {
      try {
        await authorize();
      } catch (error) {
        console.error("Authorization error:", error);
        showToast({ style: Toast.Style.Failure, title: String(error) });
      }
    })();
  });

  return (
    <List
      filtering={false}
      onSearchTextChange={setSearchText}
      navigationTitle="Cover Letters"
      searchBarPlaceholder="Search past cover letters"
      actions={actionsPanel()}
    >
      {filteredList.map((file) => (
        <List.Item key={file} title={file} actions={actionsPanel()} />
      ))}
    </List>
  );
}

export default Command;
