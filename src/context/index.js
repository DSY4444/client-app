import { LOCALES } from "../i18n/locales";
import { messages } from "../i18n/messages";
import { createContext, useReducer, useMemo, useContext } from "react";
import { IntlProvider } from "react-intl";
import { getLocale } from "../i18n/locales";

const AppContext = createContext();

const appInitialState = {
  userName: "",
  tenantName: "",
  userInfo: {},
  appDef: {},
  appLoading: true,
  norole: false,
  authorizedUser: false,
  loggedOut: false,
  darkMode: false,
  showHelpSideBar: false,
  helpCenterUrl: '',
  helpCenterToken: '',
  helpContextKey: '',
  showinapphelp: '',
  error: null,
  askYarkenEnabled: false,
}

const appReducer = (state, action) => {
  switch (action.type) {
    case "APP_LOADED": {
      return { ...state, appLoading: false };
    }
    case "MARK_USER_AUTHORIZED": {
      return {
        ...state,
        appLoading: false,
        authorizedUser: true,
        norole: false,
        userInfo: action.userInfo,
        appDef: action.appDef,
        helpCenterUrl: action.appDef?.helpCenterUrl,
        helpCenterToken: action.appDef?.helpCenterToken,
        showinapphelp: action.appDef?.showinapphelp,
        askYarkenEnabled: action.appDef?.askYarkenEnabled
      };
    }
    case "SET_NOROLE": {
      return { ...state, appLoading: false, authorizedUser: false, norole: true };
    }
    case "SET_ERROR": {
      return { ...state, error: action.value };
    }
    case "USER_LOGOUT": {
      return { ...state, loggedOut: true };
    }
    case "DARK_MODE": {
      return { ...state, darkMode: action.value };
    }
    case "TOGGLE_HELP": {
      return { ...state, showHelpSideBar: action.value || false, helpContextKey: '' };
    }
    case "SET_HELP_CONTEXT": {
      return { ...state, showHelpSideBar: true, helpContextKey: action.value || '' };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

function AppControllerProvider(props) {
  const [controller, dispatch] = useReducer(appReducer, appInitialState);
  const { appDef } = controller;
  const locale = getLocale(appDef?.settings?.locale || "");

  const value = useMemo(() => [controller, dispatch], [controller, dispatch]);

  return (
    <AppContext.Provider value={value}>
      <IntlProvider
        key={locale}
        locale={locale}
        messages={messages[locale]}
        defaultLocale={LOCALES.ENGLISH}
      >
        {props.children}
      </IntlProvider>
    </AppContext.Provider>
  );
}

const useAppController = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useAppController should be used inside the AppControllerProvider."
    );
  }

  return context;
}

const setAppLoading = (dispatch) => dispatch({ type: "APP_LOADED" });
const setNoRole = (dispatch) => dispatch({ type: "SET_NOROLE" });
const setUserAuthorized = (dispatch, userInfo, appDef) => dispatch({ type: "MARK_USER_AUTHORIZED", userInfo, appDef });
const setLogoutUser = (dispatch) => dispatch({ type: "USER_LOGOUT" });
const setDarkMode = (dispatch, value) => dispatch({ type: "DARK_MODE", value });
const toggleHelpSideBar = (dispatch, value) => dispatch({ type: "TOGGLE_HELP", value });
const openContextHelp = (dispatch, value) => dispatch({ type: "SET_HELP_CONTEXT", value });
const setError = (dispatch, value) => dispatch({ type: "SET_ERROR", value });

export {
  AppControllerProvider,
  useAppController,
  setAppLoading,
  setNoRole,
  setUserAuthorized,
  setLogoutUser,
  setDarkMode,
  toggleHelpSideBar,
  openContextHelp,
  setError
}
