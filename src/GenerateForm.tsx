import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  showHUD,
  PopToRootType,
  useNavigation,
} from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { generateLetter } from "./google";
import { useState } from "react";
import { homedir } from "os";

export type Values = {
  position: string;
  company: string;
  quality: string[];
  tech: string;
  field: string;
};

export function GenerateForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { pop } = useNavigation();

  async function handleSubmit(values: Values) {
    setIsLoading(false);
    showToast({ style: Toast.Style.Animated, title: "Generating..." });
    await generateLetter(values);
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

      <Form.TextField id="position" title="Position" defaultValue="" />

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
        <Form.TagPicker.Item value="passionate team" title="passionate team" />
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
