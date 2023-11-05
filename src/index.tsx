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
        // await service.removeTokens();
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

  async function handleSubmit() {
    service.duplicateMaster();
    // console.log((await service.fetchItems()).length);
  }

  return (
    // <Form
    //   actions={
    //     <ActionPanel>
    //       <Action.SubmitForm onSubmit={handleSubmit} />
    //     </ActionPanel>
    //   }
    // ></Form>
    <List isLoading={isLoading}>
      {items.map((item) => {
        return (
          <List.Item
            key={item.id}
            id={item.id}
            title={item.title}
            actions={
              <ActionPanel>
                <GenerateLetterAction onSubmit={handleSubmit} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
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
