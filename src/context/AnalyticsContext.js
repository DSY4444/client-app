import { createContext, useContext } from "react";

export const AnalyticsContext = createContext();

export const useAnalyticsContext= () => {
  return useContext(AnalyticsContext);
};
