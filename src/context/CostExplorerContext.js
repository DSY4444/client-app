import { createContext, useReducer, useMemo, useContext } from "react";
import produce, { current } from "immer";
import _ from "lodash";

const CostExplorerContext = createContext();

const layers = [
  { id: 1, title: "Expense Types", dataset: "expenseTypes", mappingDataset: "costPoolMappings", mappingId: "expenseTypeId", amountPropName: "amount" },
  { id: 2, title: "Accounts", dataset: "accounts", mappingDataset: "costPoolMappings", mappingId: "accountId", amountPropName: "amount" },
  { id: 3, title: "Vendors", dataset: "vendors", mappingDataset: "costPoolMappings", mappingId: "vendorId", amountPropName: "amount" },
  { id: 4, title: "Cost Pools", dataset: "costPools", mappingDataset: "costPoolMappings", mappingId: "costPoolId", amountPropName: "amount", isSelected: true },
  { id: 5, title: "Sub Cost Pools", dataset: "subCostPools", mappingDataset: "costPoolMappings", mappingId: "subCostPoolId", amountPropName: "amount" },
  { id: 6, title: "Cost Centers", dataset: "costCentres", mappingDataset: "towerMappings", mappingId: "costCentreId", amountPropName: "amount" },
  { id: 7, title: "Towers", dataset: "towers", mappingDataset: "towerMappings", mappingId: "towerId", amountPropName: "amount", isSelected: true },
  { id: 8, title: "Sub Towers", dataset: "subTowers", mappingDataset: "towerMappings", mappingId: "subTowerId", amountPropName: "amount" },
  // { id: 9, title: "Assets", dataset: "assets", mappingDataset: "assetMappings", mappingId: "asset", amountPropName: "amount", isSelected: true },
  // { id: 9, title: "Capabilities", dataset: "capabilities", mappingDataset: "capabilityMappings", mappingId: "capabilityType", amountPropName: "amount", isSelected: true },
  { id: 9, title: "Solutions", dataset: "solutionTypes", mappingDataset: "solutionOfferingMappings", mappingId: "solutionTypeId", amountPropName: "amount", isSelected: true },
  { id: 10, title: "Solution Offerings", dataset: "solutionOfferings", mappingDataset: "solutionOfferingMappings", mappingId: "solutionOfferingId", amountPropName: "amount" },
  { id: 11, title: "Business Units", dataset: "businessUnits", mappingDataset: "buMappings", mappingId: "businessUnitCode", amountPropName: "amount", isSelected: true },
]

const assetLayers = [
  // { id: 1, title: "Expense Types", dataset: "expenseTypes", mappingDataset: "costPoolMappings", mappingId: "expenseTypeId", amountPropName: "amount" },
  // { id: 2, title: "Accounts", dataset: "accounts", mappingDataset: "costPoolMappings", mappingId: "accountId", amountPropName: "amount" },
  // { id: 3, title: "Vendors", dataset: "vendors", mappingDataset: "costPoolMappings", mappingId: "vendorId", amountPropName: "amount" },
  { id: 3, title: "Cost Pools", dataset: "costPools", mappingDataset: "costPoolMappings", mappingId: "costPoolId", amountPropName: "amount", isSelected: true },
  { id: 4, title: "Sub Cost Pools", dataset: "subCostPools", mappingDataset: "costPoolMappings", mappingId: "subCostPoolId", amountPropName: "amount" },
  // { id: 5, title: "Cost Centers", dataset: "costCentres", mappingDataset: "towerMappings", mappingId: "costCentreId", amountPropName: "amount" },
  { id: 5, title: "Towers", dataset: "towers", mappingDataset: "towerMappings", mappingId: "towerId", amountPropName: "amount", isSelected: true },
  { id: 6, title: "Sub Towers", dataset: "subTowers", mappingDataset: "towerMappings", mappingId: "subTowerId", amountPropName: "amount" },
  { id: 7, title: "Assets", dataset: "assets", mappingDataset: "assetMappings", relationsDataset: "assetRelations", mappingId: "asset", amountPropName: "amount", edgeAmountPropName: "amountDirect", isSelected: true },
  // { id: 8, title: "Capabilities", dataset: "capabilities", mappingDataset: "capabilityMappings", mappingId: "capabilityType", amountPropName: "amount", isSelected: true },
  { id: 9, title: "Solutions", dataset: "solutionTypes", mappingDataset: "solutionOfferingMappings", mappingId: "solutionTypeId", amountPropName: "amount", isSelected: true },
  { id: 10, title: "Solution Offerings", dataset: "solutionOfferings", mappingDataset: "solutionOfferingMappings", mappingId: "solutionOfferingId", amountPropName: "amount" },
  { id: 11, title: "Business Units", dataset: "businessUnits", mappingDataset: "buMappings", mappingId: "businessUnitCode", amountPropName: "amount", isSelected: true },
]

const VIEWS = [
  { id: 1, name: "TBM Taxonomy", layers: layers },
  { id: 2, name: "Assets", layers: assetLayers },
]

const costExplorerInitialState = {
  loading: false,
  totalExpenditure: 0,
  masterData: {},
  mappingData: {},
  filteredMappingData: {},
  headerConfig: {
    views: VIEWS.map(v => ({ id: v.id, name: v.name })),
    viewLayers: VIEWS[0].layers,
    viewFilter: 1,
    yearFilter: null,
    monthFilter: null,
  },
  pinnedNode: null,
  filtersDataset: {},
  filters: {},
  dependentFilters: {}
}

const getDependentFilters = (filtersArray, mappingId) => {

  if ((filtersArray || []).length === 0)
    return null;

  let sortedFiltersArray = _.orderBy(filtersArray, 'layerId', 'desc')
  let dependentFilters = null;
  for (let i = sortedFiltersArray.length - 1; i >= 0; i--) {
    if ((sortedFiltersArray[i][mappingId] || []).length > 0) {
      dependentFilters = sortedFiltersArray[i][mappingId];
      break;
    }
  }

  return dependentFilters;
}

const getFilterMasterdata = (masterData, mappingData, layerMappingId, mappingIds) => {
  let filterMasterdata = [];
  if (mappingIds) {
    filterMasterdata = (mappingIds || []).map(mappingId => {
      const dataItem = masterData?.find(m => m.id === mappingId);
      return {
        id: dataItem?.id,
        title: dataItem?.name,
      };
    });
  }
  else {
    const uniqMappingsIds = _.uniqBy(mappingData || [], layerMappingId)?.map(l => l[layerMappingId])?.filter(l => l !== null);
    filterMasterdata = (uniqMappingsIds || []).map(mappingId => {
      const dataItem = masterData?.find(m => m.id === mappingId);
      return {
        id: dataItem?.id,
        title: dataItem?.name,
      };
    });
  }
  return filterMasterdata;
}

const costExplorerReducer = (state, action) => {
  switch (action.type) {
    case "LOADING": {
      return produce(state, draft => {
        draft.loading = action.isLoading || false;
      });
    }
    case "INIT_CONTEXT": {
      return produce(state, draft => {
        if (action.masterData) {
          draft.masterData = action.masterData;
          let currentYearIndex = action.masterData?.years?.length - 1;
          const currentMonthNumber = (new Date().getMonth()) + 1;
          const currentMonth = action.masterData?.months.find(m => m.id === currentMonthNumber);
          const currentFinancialYear = action.masterData?.currentFinancialYear;
          if (currentFinancialYear) {
            const index = action.masterData?.years?.map(y => y.name).indexOf(currentFinancialYear.value);
            if (index > -1)
              currentYearIndex = index;
          }
          draft.headerConfig.yearFilter = action.masterData?.years[currentYearIndex]?.id;
          draft.headerConfig.monthFilter = currentMonth?.id;
        }
      });
    }
    case "SET_MAPPING_DATA": {
      return produce(state, draft => {
        //clear filters
        draft.filters = {};

        draft.mappingData = action.mappingData;
        draft.filteredMappingData = action.mappingData;

        draft.totalExpenditure = action.mappingData ? action.mappingData.totalExpenditure?.[0].amount : 0;
        draft.headerConfig.viewLayers?.map(layer => {
          draft.filtersDataset[layer.mappingId] = getFilterMasterdata(draft.masterData[layer.dataset], action.mappingData?.[layer.mappingDataset] || [], layer.mappingId, null);
          // const mappingsIds = _.uniqBy(action.mappingData?.[layer.mappingDataset] || [], layer.mappingId)?.map(l => l[layer.mappingId])?.filter(l => l !== null);
          // draft.filtersDataset[layer.mappingId] = (mappingsIds || []).map(mappingId => {
          //   const dataItem = draft.masterData[layer.dataset]?.find(m => m.id === mappingId);
          //   return {
          //     id: dataItem?.id,
          //     title: dataItem?.name,
          //   };
          // });
        });
      });
    }
    case "PIN_NODE": {
      return produce(state, draft => {
        draft.pinnedNode = action.nodeId
      });
    }
    case "SET_HEADER_FILTER": {
      return produce(state, draft => {
        draft.headerConfig[action.name] = action.value;
        if (action.name === "viewFilter") {
          let selectedView = VIEWS?.find(v => v.id === action.value);
          if (selectedView) {
            draft.pinnedNode = null;
            draft.filters = {};
            draft.dependentFilters = {};
            draft.headerConfig.viewLayers = selectedView.layers;
            draft.headerConfig.viewLayers?.map(layer => {
              const mappingsIds = _.uniqBy(draft.mappingData?.[layer.mappingDataset] || [], layer.mappingId)?.map(l => l[layer.mappingId])?.filter(l => l !== null);
              draft.filtersDataset[layer.mappingId] = (mappingsIds || []).map(mappingId => {
                const dataItem = draft.masterData[layer.dataset]?.find(m => m.id === mappingId);
                return {
                  id: dataItem?.id,
                  title: dataItem?.name,
                };
              });
            });
          }
        }
        // clear values
        draft.pinnedNode = null;
        draft.filters = {};
        draft.filteredMappingData = draft.mappingData;
        draft.loading = false;
      });
    }
    case "TOGGLE_VIEW_LAYERS": {
      return produce(state, draft => {
        draft.headerConfig.viewLayers?.forEach(layer => {
          layer.isSelected = (action.selectedIds || []).includes(layer.title)
        });
        draft.pinnedNode = null;
      });
    }
    case "SET_FILTER": {
      return produce(state, draft => {

        // update filter datasets



        draft.filters[action.name] = action.values;
        const hasFilters = Object.values(draft.filters).filter(filter => (filter || []).length > 0)?.length > 0;

        const filterLayer = draft.headerConfig?.viewLayers.find(layer => layer.mappingId === action.name);
        const prevLayers = draft.headerConfig?.viewLayers?.filter(l => l.id < filterLayer.id && l.isSelected) || [];
        // const nextLayers = draft.headerConfig?.viewLayers?.filter(l => l.id > filterLayer.id && l.isSelected) || [];
        const dependentFilters = {};
        const filterLayerData = (draft.filters[action.name] || [])?.length === 0 ? draft.mappingData?.[filterLayer.mappingDataset] : draft.mappingData?.[filterLayer.mappingDataset]?.filter(row => draft.filters[action.name].includes(row[action.name]))
        prevLayers?.forEach(prevLayer => {
          const prevMappingId = prevLayer.mappingId;
          dependentFilters["layerId"] = filterLayer.id;
          dependentFilters[prevMappingId] = _.uniqBy(filterLayerData || [], prevMappingId)?.map(l => l[prevMappingId]);
        });
        // console.log("prevLayerMappingIds", prevLayerMappingIds, action.name, filterLayerData, dependentFilters)

        if (action.values?.length > 0) {
          draft.dependentFilters[action.name] = dependentFilters;
        } else {
          draft.dependentFilters[action.name] = null;
        }


        const dependentFilterValuesArr = Object.values(current(draft.dependentFilters) || {})?.filter(v => v !== null) || [];


        // console.log("dependentFilterValues", dependentFilterValuesArr, hasFilters)

        draft.filteredMappingData = {};
        Object.keys(draft.mappingData || {}).forEach(key => {
          if (["totalExpenditure", "assetRelations"].includes(key))
            draft.filteredMappingData[key] = draft.mappingData[key];
          else {
            // draft.filteredMappingData[key] = filterPlainArray(draft.mappingData[key], draft.filters, dependentFilters);
            if (hasFilters)
              draft.filteredMappingData[key] = draft.mappingData[key]?.filter(row => {
                return Object.keys(draft.filters)?.every(f => !row[f] || (draft.filters[f] || [])?.length === 0 || draft.filters[f].includes(row[f]))
              });
            else
              draft.filteredMappingData[key] = draft.mappingData[key]

            const cdepFilters = getDependentFilters(dependentFilterValuesArr, filterLayer.mappingId);
            // console.log("cdepFilters", filterLayer.mappingId, cdepFilters);

            if ((draft.filters[filterLayer.mappingId] || [])?.length === 0 && cdepFilters) {
              // console.log("getDependentFilters", filterLayer.title, filterLayer.mappingId, cdepFilters);
              draft.filteredMappingData[filterLayer.mappingDataset] = (draft.filteredMappingData[filterLayer.mappingDataset] || draft.mappingData[filterLayer.mappingDataset] || [])
                .filter(row => {
                  return cdepFilters.includes(row[filterLayer.mappingId]);
                })
            }

            // nextLayers
            //   .filter(layer => !draft.filters[layer.mappingId])
            //   .forEach(layer => {
            //     console.log("draft.filters", layer.mappingId, JSON.stringify(draft.filters[layer.mappingId]));
            //     // update dropdown values
            //     draft.filtersDataset[layer.mappingId] = getFilterMasterdata(draft.masterData[layer.dataset], draft.filteredMappingData[layer.mappingDataset], layer.mappingId, null)
            //   });

            prevLayers
              .filter(layer => !["totalExpenditure", "assetRelations"].includes(layer.mappingDataset))
              .forEach(layer => {
                const depFilters = getDependentFilters(dependentFilterValuesArr, layer.mappingId);
                // console.log("getDependentFilters", layer.title, layer.mappingId, depFilters);
                const filteredMappingData = (draft.filteredMappingData[layer.mappingDataset] || draft.mappingData[layer.mappingDataset] || []);
                if (depFilters) {
                  draft.filteredMappingData[layer.mappingDataset] = filteredMappingData.filter(row => depFilters.includes(row[layer.mappingId]));
                }

                // if (!draft.filters[layer.mappingId]) {
                //   console.log("draft.filters", layer.mappingId, JSON.stringify(draft.filters[layer.mappingId]));
                //   // update dropdown values
                //   draft.filtersDataset[layer.mappingId] = getFilterMasterdata(draft.masterData[layer.dataset], filteredMappingData, layer.mappingId, depFilters)
                // }
              });

          }
        });

        draft.pinnedNode = null;
      });
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

export const CostExplorerContextProvider = (props) => {
  const [state, dispatch] = useReducer(costExplorerReducer, costExplorerInitialState);

  const value = useMemo(() => [state, dispatch], [state, dispatch]);

  return (
    <CostExplorerContext.Provider value={value}>
      {props.children}
    </CostExplorerContext.Provider>
  );
}

export const useCostExplorerContext = () => {
  return useContext(CostExplorerContext);
}

export const setLoading = (dispatch, isLoading) => dispatch({ type: "LOADING", isLoading });
export const initExplorer = (dispatch, masterData) => dispatch({ type: "INIT_CONTEXT", masterData });
export const setMappingData = (dispatch, mappingData) => dispatch({ type: "SET_MAPPING_DATA", mappingData });
export const setHeaderFilter = (dispatch, name, value) => dispatch({ type: "SET_HEADER_FILTER", name, value });
export const toggleViewLayers = (dispatch, selectedIds) => dispatch({ type: "TOGGLE_VIEW_LAYERS", selectedIds });
export const pinNode = (dispatch, nodeId) => dispatch({ type: "PIN_NODE", nodeId });
export const setFilter = (dispatch, name, values) => dispatch({ type: "SET_FILTER", name, values });
