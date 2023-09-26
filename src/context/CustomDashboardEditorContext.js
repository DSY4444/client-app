import produce from "immer";
import { createContext, useReducer, useMemo, useContext } from "react";
import { toInt } from "utils";

export const DEFAULT_FILTERS = [
    {
        id: 1,
        name: "Years",
        queryName: "Years.year",
        operator: "equals",
        query: {
            order: { "Years.srl": "desc" },
            dimensions: ["Years.year", "Years.srl"]
        },
    },
    {
        id: 2,
        name: "Months",
        queryName: "Months.month",
        operator: "equals",
        query: {
            order: { "Months.srl": "desc" },
            dimensions: ["Months.month", "Months.srl"]
        },
    },
    {
        id: 3,
        name: "Expense Types",
        queryName: "ExpenseTypes.name",
        operator: "equals",
        query: {
            order: { "ExpenseTypes.name": "desc" },
            dimensions: ["ExpenseTypes.name"]
        },
    },
    {
        id: 4,
        name: "Accounts",
        queryName: "Accounts.description",
        operator: "equals",
        query: {
            order: { "Accounts.description": "asc" },
            dimensions: ["Accounts.description"]
        },
    },
    {
        id: 5,
        name: "Cost Centers",
        queryName: "CostCentres.description",
        operator: "equals",
        query: {
            order: { "CostCentres.description": "asc" },
            dimensions: ["CostCentres.description"]
        },
    },
    {
        id: 6,
        name: "Vendors",
        queryName: "Vendors.name",
        operator: "equals",
        query: {
            order: { "Vendors.name": "asc" },
            dimensions: ["Vendors.name"]
        },
    },
    {
        id: 7,
        name: "Cost Pools",
        queryName: "CostPools.costPool",
        operator: "equals",
        query: {
            order: { "CostPools.costPool": "asc" },
            dimensions: ["CostPools.costPool"]
        },
    },
    {
        id: 8,
        name: "Towers",
        queryName: "Towers.tower",
        operator: "equals",
        query: {
            order: { "Towers.tower": "asc" },
            dimensions: ["Towers.tower"]
        },
    },
    {
        id: 9,
        name: "Solution Types",
        queryName: "SolutionTypes.solutionType",
        operator: "equals",
        query: {
            order: { "SolutionTypes.solutionType": "asc" },
            dimensions: ["SolutionTypes.solutionType"]
        },
    },
    {
        id: 9,
        name: "Solution Categories",
        queryName: "SolutionCategories.solutionCategory",
        operator: "equals",
        query: {
            order: { "SolutionCategories.solutionCategory": "asc" },
            dimensions: ["SolutionCategories.solutionCategory"]
        },
    },
    {
        id: 10,
        name: "Solution Names",
        queryName: "SolutionNames.solutionName",
        operator: "equals",
        query: {
            order: { "SolutionNames.solutionName": "asc" },
            dimensions: ["SolutionNames.solutionName"]
        },
    },
    {
        id: 11,
        name: "Solution Offerings",
        queryName: "SolutionOfferings.solutionOffering",
        operator: "equals",
        query: {
            order: { "SolutionOfferings.solutionOffering": "asc" },
            dimensions: ["SolutionOfferings.solutionOffering"]
        },
    },
    {
        id: 12,
        name: "Business Units",
        queryName: "BusinessUnits.businessUnit",
        operator: "equals",
        query: {
            order: { "BusinessUnits.businessUnit": "asc" },
            dimensions: ["BusinessUnits.businessUnit"]
        },
    }
];


const resizeHandles = ["s", "e", "se"];

const DEFAULT_DASHBOARDCONFIG = {
    layouts: { lg: [] },
    widgets: [],
    filters: [],
};

const defaultChartDimesions = {
    "table": { h: 6, w: 6, minW: 4, minH: 4 },
    "pivot-table": { h: 6, w: 12, minW: 4, minH: 4 },
    "chart": { h: 6, w: 6, minW: 4, minH: 4 },
    "stats": { h: 2, w: 2, minW: 2, minH: 1 },
    "header": { h: 1, w: 6, minW: 2, minH: 1 },
};


const CustomDashboardEditorContext = createContext();

const dashboardEditorInitialState = {
    displayName: "",
    config: DEFAULT_DASHBOARDCONFIG,
    selectedFilterId: null,
}

const dashboardEditorReducer = (state, action) => {
    switch (action.type) {
        case "INIT_CONTEXT": {
            return produce(state, draft => {
                draft.displayName = action.displayName;
                draft.config = action.config;
            });
        }
        case "SET_FILTER": {
            return produce(state, draft => {
                draft.selectedFilterId = action.selectedFilterId;
            });
        }
        case "FILTER_CONFIG_CHANGE": {
            return produce(state, draft => {
                let selectedFilter = draft.config.filters?.find(f => f.queryName === action.selectedFilterId);
                if (selectedFilter) {
                    selectedFilter.name = action.updatedConfig.name;
                    selectedFilter.filterType = action.updatedConfig.filterType;
                    selectedFilter.required = action.updatedConfig.required;
                }
            });
        }
        case "ADD_FILTER_DEPENDENT": {
            return produce(state, draft => {
                let selectedFilter = draft.config.filters?.find(f => f.queryName === action.selectedFilterId);
                if (selectedFilter) {
                    selectedFilter.dependencies = (selectedFilter.dependencies || []).concat(action.widgetId);
                }
            });
        }
        case "DELETE_FILTER_DEPENDENT": {
            return produce(state, draft => {
                let selectedFilter = draft.config.filters?.find(f => f.queryName === action.selectedFilterId);
                if (selectedFilter) {
                    selectedFilter.dependencies = (selectedFilter.dependencies || []).filter(w => w !== action.widgetId);
                }
            });
        }
        case "SELECT_FILTER": {
            return produce(state, draft => {
                let selectedFilter = DEFAULT_FILTERS.find(f => f.name === action.selectedFilter.name);
                if (selectedFilter)
                    draft.config.filters = [...(draft.config.filters || []), selectedFilter];
            });
        }
        case "DELETE_FILTER": {
            return produce(state, draft => {
                draft.config.filters = draft.config.filters?.filter(f => f.queryName !== action.selectedFilterName);
                if (draft.selectedFilterId === action.selectedFilterId)
                    draft.selectedFilterId = null;
            });
        }
        case "CLEAR_FILTERS": {
            return produce(state, draft => {
                draft.config.filters = [];
                draft.selectedFilterId = null;
            });
        }
        case "ADD_WIDGET": {
            return produce(state, draft => {
                const dimensions = defaultChartDimesions[action.widgetConfig?.vizState.chartType] || defaultChartDimesions["chart"]
                let dLayouts = draft.config?.layouts;
                let widgets = draft.config?.widgets;
                let vizOptions = {
                    ...action.widgetConfig?.vizOptions,
                    ...{
                        config: {
                            ...action.widgetConfig?.vizOptions.config
                        }
                    }
                };
                if (vizOptions.config) {
                    vizOptions.config["card_title"] = vizOptions.config["card_title"] || action.name;
                }
                widgets.push({
                    id: action.widgetId,
                    name: action.name,
                    vizState: action.widgetConfig?.vizState,
                    vizOptions: vizOptions,
                    filters: action.widgetConfig?.filters,
                    filterConditionType: action.widgetConfig?.filterConditionType,
                });


                let x = 0, y = 0;
                if (dLayouts["lg"]?.length > 0) {
                    let ys = dLayouts["lg"]?.map(w => w.y) || [0]
                    let my = Math.max(...ys)

                    let hs = dLayouts["lg"]?.filter(w => w.y === my)?.map(w => w.h) || [0]
                    let h = Math.max(...hs)
                    y = my + h;
                }

                dLayouts["lg"].push(
                    Object.assign({
                        i: action.widgetId,
                        x: x,
                        y: y,
                        resizeHandles,
                    }, dimensions)
                );
            });
        }
        case "DUPLICATE_WIDGET": {
            return produce(state, draft => {
                let widgets = draft.config?.widgets;
                const widget = widgets?.find(w => w.id === action.widgetId);
                if (widget) {
                    let newWidget = { ...widget, id: action.genWidgetId }
                    let dLayouts = draft.config.layouts;
                    widgets.push(newWidget);

                    const defaultDimensions = defaultChartDimesions[widget?.vizState.chartType] || defaultChartDimesions["chart"];
                    let widgetDimensions = dLayouts["lg"]?.find(w => w.i === action.widgetId);
                    if (widgetDimensions)
                        widgetDimensions = { h: widgetDimensions.h, w: widgetDimensions.w };

                    let x = 0, y = 0;
                    if (dLayouts["lg"]?.length > 0) {
                        let ys = dLayouts["lg"]?.map(w => w.y) || [0]
                        let my = Math.max(...ys)

                        let hs = dLayouts["lg"]?.filter(w => w.y === my)?.map(w => w.h) || [0]
                        let h = Math.max(...hs)
                        y = my + h;
                    }

                    dLayouts["lg"].push(
                        Object.assign({
                            i: action.genWidgetId,
                            x: x,
                            y: y,
                            resizeHandles,
                        }, defaultDimensions, widgetDimensions || {})
                    );
                }
            });
        }
        case "DELETE_WIDGET": {
            return produce(state, draft => {
                draft.config.layouts["lg"] = draft.config.layouts["lg"].filter(w => w.i !== action.widgetId)
                draft.config.widgets = draft.config.widgets.filter(w => w.id !== action.widgetId);
                draft.config.filters = draft.config.filters?.map(f => {
                    f.dependencies = (f.dependencies || []).filter(d => d !== action.widgetId)
                    return f;
                });
            });
        }
        case "WIDGET_CONFIG_CHANGE": {
            return produce(state, draft => {
                let w = draft.config.widgets.find(w => w.id === action.widgetId);
                if (w) {
                    if (w?.vizOptions?.config) {
                        w.vizOptions.config[action.configName] = action.value;
                    }
                    if (action.configName === "top_n") {
                        let newQuery = { ...w?.vizState?.query, ...{ limit: toInt(action.value || 10000) } };
                        w.vizState.query = newQuery;
                    }
                }
            });
        }
        case "WIDGET_FILTER_CHANGE": {
            return produce(state, draft => {
                let w = draft.config.widgets.find(w => w.id === action.widgetId);
                if (w?.filters?.length > 0) {
                    let f = w.filters.find(f => f.name === action.filterName);
                    if (f) {
                        f.operator = action.operator;
                        f.values = action.values;

                        let newFilters = w.filters.filter(f => ["set", "notSet"].includes(f.operator) || (f.values && f.values.length > 0))?.map(
                            f => ({
                                member: f.name,
                                operator: f.operator,
                                values: f.values
                            })
                        );
                        w.vizState.query["filters"] = w.filterConditionType === "or" ? [{ "or": newFilters }] : newFilters;
                    }
                }
            });
        }
        case "LAYOUT_CHANGE": {
            return produce(state, draft => {
                draft.config.layouts["lg"] = action.updatedLayout;
            });
        }
        case "RESET_DASHBOARD": {
            return produce(state, draft => {
                draft.config = DEFAULT_DASHBOARDCONFIG
            });
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`);
        }
    }
};

export const CustomDashboardEditorContextProvider = (props) => {
    const [controller, dispatch] = useReducer(dashboardEditorReducer, dashboardEditorInitialState);

    const value = useMemo(() => [controller, dispatch], [controller, dispatch]);

    return (
        <CustomDashboardEditorContext.Provider value={value}>
            {props.children}
        </CustomDashboardEditorContext.Provider>
    );
}

export const useCustomDashboardEditorContext = () => {
    const context = useContext(CustomDashboardEditorContext);

    if (!context) {
        throw new Error(
            "useCustomDashboardEditorContext should be used inside the CustomDashboardEditorContextProvider."
        );
    }

    return context;
}

export const initDashboard = (dispatch, displayName, config) => dispatch({ type: "INIT_CONTEXT", displayName, config });
export const addWidget = (dispatch, widgetId, name, widgetConfig) => dispatch({ type: "ADD_WIDGET", widgetId, name, widgetConfig });
export const duplicateWidget = (dispatch, widgetId, genWidgetId) => dispatch({ type: "DUPLICATE_WIDGET", widgetId, genWidgetId });
export const deleteWidget = (dispatch, widgetId) => dispatch({ type: "DELETE_WIDGET", widgetId });
export const widgetConfigChange = (dispatch, widgetId, configName, value) => dispatch({ type: "WIDGET_CONFIG_CHANGE", widgetId, configName, value });
export const widgetFilterChange = (dispatch, widgetId, filterName, operator, values) => dispatch({ type: "WIDGET_FILTER_CHANGE", widgetId, filterName, operator, values });
export const layoutChange = (dispatch, updatedLayout) => dispatch({ type: "LAYOUT_CHANGE", updatedLayout });
export const resetDashboard = (dispatch) => dispatch({ type: "RESET_DASHBOARD" });

export const setFilter = (dispatch, selectedFilterId) => dispatch({ type: "SET_FILTER", selectedFilterId });
export const selectFilter = (dispatch, selectedFilter) => dispatch({ type: "SELECT_FILTER", selectedFilter });
export const filterConfigChange = (dispatch, selectedFilterId, updatedConfig) => dispatch({ type: "FILTER_CONFIG_CHANGE", selectedFilterId, updatedConfig });
export const addFilterDependent = (dispatch, selectedFilterId, widgetId) => dispatch({ type: "ADD_FILTER_DEPENDENT", selectedFilterId, widgetId });
export const deleteFilterDependent = (dispatch, selectedFilterId, widgetId) => dispatch({ type: "DELETE_FILTER_DEPENDENT", selectedFilterId, widgetId });
export const deleteFilter = (dispatch, selectedFilterName) => dispatch({ type: "DELETE_FILTER", selectedFilterName });
export const clearFilters = (dispatch) => dispatch({ type: "CLEAR_FILTERS" });

