import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  List,
} from "@raycast/api";
import * as google from "./google";
import { useEffect, useState } from "react";

type Values = {
  textfield: string;
  textarea: string;
  datepicker: Date;
  checkbox: boolean;
  dropdown: string;
  tokeneditor: string[];
};

export default function Command() {
  const service = google;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [items, setItems] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        console.log(process.env);
        await service.authorize();
        const fetchedItems = await service.fetchItems();
        setItems(fetchedItems);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        showToast({ style: Toast.Style.Failure, title: String(error) });
      }
    })();
  }, [service]);

  async function handleSubmit(values: Values) {
    service.duplicateMaster();
    // console.log((await service.fetchItems()).length);
  }

  return (
    // <List isLoading={isLoading}>
    //   {items.map((item) => {
    //     return <List.Item key={item.id} id={item.id} title={item.title} />;
    //   })}
    // </List>
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="This form showcases all available form elements." />
      <Form.TextField
        id="textfield"
        title="Text field"
        placeholder="Enter text"
        defaultValue="Raycast"
      />
      <Form.TextArea
        id="textarea"
        title="Text area"
        placeholder="Enter multi-line text"
      />
      <Form.Separator />
      <Form.DatePicker id="datepicker" title="Date picker" />
      <Form.Checkbox
        id="checkbox"
        title="Checkbox"
        label="Checkbox Label"
        storeValue
      />
      <Form.Dropdown id="dropdown" title="Dropdown">
        <Form.Dropdown.Item value="dropdown-item" title="Dropdown Item" />
      </Form.Dropdown>
      <Form.TagPicker id="tokeneditor" title="Tag picker">
        <Form.TagPicker.Item value="tagpicker-item" title="Tag Picker Item" />
      </Form.TagPicker>
    </Form>
  );
}
