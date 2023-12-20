import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  showHUD,
  PopToRootType,
  List,
  useNavigation,
} from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import * as google from "./google";
import { useEffect, useState } from "react";
import fs from "fs";
import { homedir } from "os";

export type Values = {
  position: string;
  company: string;
  quality: string[];
  tech: string;
  field: string;
};

const testFolder = `${homedir()}/Documents/CoOp`;
const fileList = fs
  .readdirSync(testFolder)
  .filter((file) => file.includes("_Bhavya_Muni_cover_letter.pdf"));
export default function Command() {
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
    >
      {filteredList.map((file) => (
        <List.Item
          key={file}
          title={file}
          actions={
            <ActionPanel>
              <Action
                title="Create New..."
                onAction={() => push(<CreateLetterForm />)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export function CreateLetterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { pop } = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        await google.authorize();
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        showToast({ style: Toast.Style.Failure, title: String(error) });
      }
    })();
  }, [google]);

  async function handleSubmit(values: Values) {
    setIsLoading(true);
    showToast({ style: Toast.Style.Animated, title: "Generating..." });
    await google.generateLetter(values);
    showToast({ style: Toast.Style.Success, title: "✅" });
    setIsLoading(false);
    await runAppleScript(`
    tell application "Finder"
        activate
        open ("${homedir()}/Documents/CoOp/" as POSIX file)
    end tell`);
    await showHUD("Done ✅", {
      clearRootSearch: true,
      popToRootType: PopToRootType.Immediate,
    });
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
          <Action
            title="Cancel"
            shortcut={{ modifiers: ["cmd"], key: "." }}
            onAction={() => pop()}
          />
        </ActionPanel>
      }
      isLoading={isLoading}
    >
      <Form.TextField id="company" title="Company" defaultValue="" />

      <Form.Dropdown id="position" title="Position" filtering={true}>
        <Form.Dropdown.Item
          value="Software Developer Intern"
          title="Software Developer Intern"
        />
        <Form.Dropdown.Item
          value="Software Developer Co-Op"
          title="Software Developer Co-Op"
        />
        <Form.Dropdown.Item
          value="Software Engineer Intern"
          title="Software Engineer Intern"
        />
        <Form.Dropdown.Item
          value="Software Engineer Co-Op"
          title="Software Engineer Co-Op"
        />
      </Form.Dropdown>

      <Form.TagPicker id="quality" title="Qualities">
        <Form.TagPicker.Item
          value="challenging work"
          title="challenging work"
        />
        <Form.TagPicker.Item
          value="fast-paced environment"
          title="fast-paced environment"
        />
        <Form.TagPicker.Item value="impactful work" title="impactful work" />
        <Form.TagPicker.Item
          value="passtionate team"
          title="passtionate team"
        />
        <Form.TagPicker.Item
          value="creative freedom"
          title="creative freedom"
        />
        <Form.TagPicker.Item value="open culture" title="open culture" />
        <Form.TagPicker.Item
          value="motivating culture"
          title="motivating culture"
        />
        <Form.TagPicker.Item value="global impact" title="global impact" />
        <Form.TagPicker.Item
          value="environmental impact"
          title="environmental impact"
        />
      </Form.TagPicker>

      <Form.TextField id="tech" title="Tech" defaultValue="" />

      <Form.TextField id="field" title="Field" defaultValue="" />
    </Form>
  );
}
