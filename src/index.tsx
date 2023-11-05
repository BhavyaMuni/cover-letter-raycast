import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  showHUD,
  PopToRootType,
} from "@raycast/api";
import * as google from "./google";
import { useEffect, useState } from "react";

export type Values = {
  position: string;
  company: string;
  quality: string[];
  tech: string;
  field: string;
};

export default function Command() {
  const service = google;
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        await service.authorize();
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        showToast({ style: Toast.Style.Failure, title: String(error) });
      }
    })();
  }, [service]);

  async function handleSubmit(values: Values) {
    setIsLoading(true);
    showToast({ style: Toast.Style.Animated, title: "Generating..." });
    await service.generateLetter(values);
    showToast({ style: Toast.Style.Success, title: "✅" });
    setIsLoading(false);
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
        </ActionPanel>
      }
      isLoading={isLoading}
    >
      <Form.TextField id="company" title="Company" defaultValue="" />

      <Form.Dropdown id="position" title="Position">
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
    // <List isLoading={isLoading}>
    //   {items.map((item) => {
    //     return (
    //       <List.Item
    //         key={item.id}
    //         id={item.id}
    //         title={item.title}
    //         actions={
    //           <ActionPanel>
    //             <GenerateLetterAction onSubmit={handleSubmit} />
    //           </ActionPanel>
    //         }
    //       />
    //     );
    //   })}
    // </List>
  );
}

function GenerateLetterAction(props: { onSubmit: () => void }) {
  return (
    <Action
      title="Duplicate Master"
      shortcut={{ modifiers: ["ctrl"], key: "x" }}
      onAction={props.onSubmit}
    />
  );
}
