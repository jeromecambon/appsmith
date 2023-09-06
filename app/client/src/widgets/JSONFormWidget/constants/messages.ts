export function createMessage(
  format: (...strArgs: any[]) => string,
  ...args: any[]
) {
  return format(...args);
}

// JSON Form
export const NO_FIELDS_ADDED = () => "No fields added";
export const JSON_FORM_CONNECT_OVERLAY_TEXT = () =>
  "Generate a form from a datasource or write a JSON schema";
export const JSON_FORM_CONNECT_BUTTON_TEXT = () => "Generate form";
export const SUCCESSFULL_BINDING_MESSAGE = () =>
  "Successfully created! Refresh the table to see updates";
export const ONSUBMIT_NOT_CONFIGURED_MESSAGE = (widgetName: string) =>
  `onSubmit event is not configured for ${widgetName}`;
export const ONSUBMIT_NOT_CONFIGURED_ACTION_TEXT = () => "Learn more";

export const NO_CONNECTABLE_WIDGET_FOUND = () =>
  "Add a table or list widget with data to get the values from";
