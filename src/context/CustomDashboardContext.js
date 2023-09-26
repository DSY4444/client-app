import { createContext, useReducer, useMemo, useContext } from "react";
import produce from "immer";
import { getDefaultReportVariables } from "utils/dashboard";

const CustomDashboardContext = createContext();

const dashboardInitialState = {
  dashboardDef: {},
  widgets: [],
  filters: [],
  variables: {},
  selectedFilters: []
}

const applyDefaultFilterForQuery = (filter, query) => {
  if (!query["filters"])
    query["filters"] = []
  let fils = []
  let found = false
  query["filters"].map((f) => {
    if (f.member === filter.queryName) {
      filter.values = filter.session ?
        sessionStorage[filter.defaultValue[0]]?.split(",") :
        filter.defaultValue;

      found = true
      return fils.push({ ...f })
    } else {
      return fils.push({ ...f })
    }
  })
  if (!found) {
    fils.push({
      "member": filter.queryName,
      "operator": "equals",
      "values": filter.session ?
        sessionStorage[filter.defaultValue[0]]?.split(",") : filter.defaultValue
    });
  }
  query["filters"] = fils
}

export const applyDefaultFilters = (state) => {
  if (state.widgets?.length > 0 && state.filters?.length > 0)
    state.filters.forEach(filter => {
      if ((filter.dependencies || []).length > 0 && (filter.defaultValue || []).length > 0) {
        state.widgets
          .filter(w => filter.dependencies.inlcudes(w.id))
          .forEach((widget) => {
            applyDefaultFilterForQuery(filter, widget.vizState.query)
          })
        filter.defaultSelected = true;
        filter.values = filter.session ?
          sessionStorage[filter.defaultValue[0]]?.split(",") : filter.defaultValue;
      }
    })
}

const setSelectedFilterForQuery = (originalWidgetQuery, query, member, operator, values) => {
  let originalQueryHasSelectedFilter = (originalWidgetQuery?.filters || [])?.find(f => f.member === member);
  let selectedFilter = query.filters?.find(f => f.member === member);
  let filterValues = [...values];
  if (originalQueryHasSelectedFilter)
    filterValues = [...filterValues, ...originalQueryHasSelectedFilter.values];
  if (selectedFilter) {
    selectedFilter.values = filterValues;
  }
  else {
    query.filters?.push({ member, operator, values: filterValues });
  }

  if ((values || []).length === 0) {
    if (originalQueryHasSelectedFilter) {
      let queryFilter = (query?.filters || [])?.find(f => f.member === member);
      queryFilter.values = originalQueryHasSelectedFilter.values?.concat([]);
    }
    else
      query.filters = (query.filters || [])?.filter(f => f.member !== member);
  }
}

const deleteSelectedFilterForQuery = (originalWidgetQuery, query, filterName) => {
  let originalQueryHasSelectedFilter = (originalWidgetQuery?.filters || [])?.find(f => f.member === filterName);
  if (originalQueryHasSelectedFilter) {
    let selectedFilter = (query?.filters || [])?.find(f => f.member === filterName);
    selectedFilter.values = originalQueryHasSelectedFilter.values;
  }
  else
    query.filters = (query.filters || [])?.filter(f => filterName !== f.member);
}

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case "INIT_CONTEXT": {
      const variables = getDefaultReportVariables(action.dashboardDef?.variables?.yearNameFormat, action.dashboardDef?.variables?.firstMonth);
      return produce(state, draft => {
        draft.dashboardDef = action.dashboardDef;
        draft.widgets = action.dashboardDef?.config?.widgets || [];
        draft.filters = action.dashboardDef?.config?.filters || [];
        draft.variables = variables;
        applyDefaultFilters(draft);
      });
    }
    case "SET_FILTER": {
      return produce(state, draft => {
        let selectedFilter = draft.selectedFilters?.find(f => f.name === action.selectedFilter.name);
        if (selectedFilter) {
          selectedFilter.values = action.selectedFilter.values;
          // set dependent widget filter values
          if (selectedFilter.dependencies?.length > 0)
            draft.widgets?.filter(w => selectedFilter.dependencies.includes(w.id))?.map(w => {
              const originalWidget = draft.dashboardDef?.config?.widgets?.find(ow => ow.id === w.id);
              setSelectedFilterForQuery(originalWidget?.vizState?.query, w.vizState.query, selectedFilter.queryName, selectedFilter.operator, selectedFilter.values || [])
            })
        }
      });
    }
    case "SELECT_FILTER": {
      return produce(state, draft => {
        let selectedFilter = draft.filters?.find(f => f.name === action.selectedFilter.name);
        if (selectedFilter)
          draft.selectedFilters.push(selectedFilter);
      });
    }
    case "DELETE_FILTER": {

      return produce(state, draft => {
        draft.selectedFilters = draft.selectedFilters?.filter(f => f.queryName !== action.selectedFilterName);
        let selectedFilter = draft.filters?.find(f => f.queryName === action.selectedFilterName);
        // set dependent widget filter values
        if (selectedFilter && selectedFilter.dependencies?.length > 0)
          draft.widgets?.filter(w => selectedFilter.dependencies.includes(w.id))?.map((w) => {
            const originalWidget = draft.dashboardDef?.config?.widgets?.find(ow => ow.id === w.id);
            deleteSelectedFilterForQuery(originalWidget?.vizState?.query, w.vizState.query, action.selectedFilterName);
          })
      });
    }
    case "CLEAR_FILTERS": {
      return produce(state, draft => {
        draft.selectedFilters = [];
        draft.widgets = draft.dashboardDef?.config?.widgets || [];
      });
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

export const CustomDashboardContextProvider = (props) => {
  const [state, dispatch] = useReducer(dashboardReducer, dashboardInitialState);

  const value = useMemo(() => [state, dispatch], [state, dispatch]);

  return (
    <CustomDashboardContext.Provider value={value}>
      {props.children}
    </CustomDashboardContext.Provider>
  );
}

export const useCustomDashboardContext = () => {
  return useContext(CustomDashboardContext);
}

export const initDashboard = (dispatch, dashboardDef) => dispatch({ type: "INIT_CONTEXT", dashboardDef });
export const setFilter = (dispatch, selectedFilter) => dispatch({ type: "SET_FILTER", selectedFilter });
export const selectFilter = (dispatch, selectedFilter) => dispatch({ type: "SELECT_FILTER", selectedFilter });
export const deleteFilter = (dispatch, selectedFilterName) => dispatch({ type: "DELETE_FILTER", selectedFilterName });
export const clearFilters = (dispatch) => dispatch({ type: "CLEAR_FILTERS" });