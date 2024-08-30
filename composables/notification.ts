export const useNotification = () => {
  const toast = useToast();

  // Helper function to add a notification with the specified color
  function notify({
    id,
    description,
    title,
    type,
  }: {
    id: string;
    description: string;
    title: string;
    type: "success" | "warning" | "error" | "info";
  }) {
    let color = "primary" as NotificationColor;
    switch (type) {
      case "success":
        color = "green";
        break;
      case "warning":
        color = "yellow";
        break;
      case "error":
        color = "rose";
        break;
      case "info":
        color = "blue";
    }

    toast.add({
      id,
      title,
      description,
      color,
    });
  }

  // Specific notification functions
  function success({
    id,
    description,
    title,
  }: {
    id: string;
    description: string;
    title: string;
  }) {
    notify({ id, description, title, type: "success" });
  }

  function warning({
    id,
    description,
    title,
  }: {
    id: string;
    description: string;
    title: string;
  }) {
    notify({ id, description, title, type: "warning" });
  }

  function error({
    id,
    description,
    title,
  }: {
    id: string;
    description: string;
    title: string;
  }) {
    notify({ id, description, title, type: "error" });
  }

  function info({
    id,
    description,
    title,
  }: {
    id: string;
    description: string;
    title: string;
  }) {
    notify({ id, description, title, type: "info" });
  }

  return { success, warning, error, info };
};

type NotificationColor =
  | "gray"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  | "driftwood"
  | "primary";
