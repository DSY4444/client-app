import { createContext, useReducer, useMemo, useContext } from "react";

const DashboardContext = createContext();

const dashboardInitialState = {
    variables: {},
    filters: []
}

const dashboardReducer = (state, action) => {
    switch (action.type) {
        case "INIT_CONTEXT": {
            return { ...state, variables: action.variables, filters: action.filters };
        }
        case "SET_FILTERS": {
            return { ...state, filters: action.filters };
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`);
        }
    }
};

function DashboardContextProvider(props) {
    const [state, dispatch] = useReducer(dashboardReducer, dashboardInitialState);

    const value = useMemo(() => [state, dispatch], [state, dispatch]);

    return (
        <DashboardContext.Provider value={value}>
            {props.children}
        </DashboardContext.Provider>
    );
}

const useDashboardContext = () => {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error(
            "useDashboardContext should be used inside the DashboardContextProvider."
        );
    }

    return context;
}

const initDashboardContext = (dispatch, filters, variables) => dispatch({ type: "INIT_CONTEXT", filters, variables });
const setDashboardContextFilters = (dispatch, filters) => dispatch({ type: "SET_FILTERS", filters });

export {
    DashboardContextProvider,
    useDashboardContext,
    initDashboardContext,
    setDashboardContextFilters,
}