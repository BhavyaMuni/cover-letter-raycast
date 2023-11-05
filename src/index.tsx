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

export type Values = {
  date: Date;
  position: string;
  company: string;
  quality: string[];
  tech: string;
  field: string;
};

export default function Command() {
  const service = google;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [items, setItems] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
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
    // service.generateLetter(values);
    console.log(service.formatQualities(["a", "b", "c"]));
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
