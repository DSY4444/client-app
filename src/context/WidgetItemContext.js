import { createContext, useContext } from "react";

export const WidgetItemContext = createContext();

export const useWidgetItemContext = () => {
  return useContext(WidgetItemContext);
};
