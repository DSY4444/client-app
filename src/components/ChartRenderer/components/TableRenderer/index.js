import { useContext, useEffect, useRef, useState } from 'react';
import DataTable from 'components/DataTable';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import numeral from "numeral";
import _ from 'lodash';
import { useYADialog } from "components/YADialog";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MDBadge from 'components/MDBadge';
import DashboardItem from 'components/DashboardItem';
import { CubeContext } from '@cubejs-client/react';
import ErrorBox from 'components/ErrorBox';
import produce from "immer"
import ColumnOptions from './components/ColumnOptions';
import moment from 'moment';
import SubChartRenderer from './components/SubChartRenderer';
import * as XLSX from 'xlsx';
import { getDrilldownPath, removeSessionFilter } from 'utils';
import { useAppController } from 'context';
import { Autocomplete, Icon } from '@mui/material';
import MDAvatar from 'components/MDAvatar';
import { normalizeCurrency } from 'utils/table';
import { useDashboardContext } from 'components/DashboardContext';
import { parseAndMergeTableResultset } from 'utils/charts';
import { isTimeDimensionQuery } from 'utils/dashboard';
import { parseTableColumnValue } from 'utils/charts';
import MDInput from 'components/MDInput';
import MDPagination from 'components/MDPagination';
const getValue = (row, propName) => row.values[propName.replace(/\./g, "__")];

const loadQuery = async (cubejsApi, column, tableQuery) => {
  const { name, vizState: { query } } = column;

  const queryNew = produce(query, draftQuery => {
    draftQuery.dimensions.push(...tableQuery.dimensions);
    draftQuery.dimensions = [...new Set(draftQuery.dimensions)];
    draftQuery.filters.push(...tableQuery.filters);
  });

  try {
    const response = await cubejsApi.load(queryNew);
    return {
      name: name.replace(/\./g, "__"),
      resultSet: response,
      error: null
    };
  } catch (error) {
    return {
      name: name.replace(/\./g, "__"),
      resultSet: null,
      error
    };
  }
}

const loadQueryResult = async (cubejsApi, query, pagingOptions, disableServerSidePaging) => {
  let newQuery = { ...query };
  if (pagingOptions) {
    const { pageSize, currentPage, selectedColumns } = pagingOptions;
    newQuery.dimensions = newQuery.dimensions.filter(d => selectedColumns.includes(d));
    newQuery.measures = newQuery.measures.filter(m => selectedColumns.includes(m));
    if (!disableServerSidePaging) {
      newQuery["limit"] = pageSize + 1;
      newQuery["offset"] = currentPage === 0 ? 0 : (currentPage * pageSize);
    }
  }
  try {
    const response = await cubejsApi.load(newQuery);
    return {
      resultSet: response,
      error: null
    };
  } catch (error) {
    return {
      resultSet: null,
      error
    };
  }
}

const TableRenderer = ({ title, subtitle, chartHelpContextKey, vizState, vizOptions }) => {
  const { reportId } = useParams();
  const columnsDef = vizOptions.columns;
  const selectedColumnsInitial = columnsDef?.filter((c) => !c.optional).map((c) => c.name);
  const mounted = useRef(false);
  const { cubejsApi } = useContext(CubeContext);
  const [result, setResult] = useState(null);
  const [pageOptions, setPageOptions] = useState({ selectedColumns: selectedColumnsInitial, currentPage: 0, pageSize: vizOptions.defaultPageSize || 20 });
  const [pgIndx, setPgIndx] = useState(0)
  const [widgetName, setWidgetName] = useState('');
  const [search, setSearch] = useState(null);
  let [hidefooter, setHidefooter] = useState(false)
  const onPageOptionsChange = (pageOptionsVal) => {
    setPageOptions(prev => ({ ...prev, ...pageOptionsVal }));
  };

  useEffect(async () => {
    if (!mounted.current) {
      mounted.current = true;
      let widgetRef = reportId + '-' + title.toLowerCase().replaceAll(' ', '-');
      setWidgetName(widgetRef);
      if (widgetRef.indexOf("undefined") === -1 && sessionStorage[widgetRef])
        onPageOptionsChange({ selectedColumns: sessionStorage[widgetRef].split(',') })
    }

    setResult(null);
    const result = await loadQueryResult(cubejsApi, vizState.query, pageOptions, vizOptions.disableServerSidePaging);
    setResult(result);
  }, [pageOptions, vizState]);

  const loading = !result;

  if (result?.error) {
    return <ErrorBox error={result?.error} />
  }

  if (loading)
    return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>

  return <TableRenderer1 {...({ title, subtitle, resultSet: result.resultSet, error: result.error, chartHelpContextKey, vizState, vizOptions, pageOptions, onPageOptionsChange, widgetName, setPgIndx, pgIndx, search, setSearch, setPageOptions, selectedColumnsInitial ,hidefooter, setHidefooter})} />
}

const chipStyles = () => ({
  cursor: 'pointer',
  "& .MuiOutlinedInput-notchedOutline": { border: 'none' },
})

const entries = [20, 30, 40, 50];

const TableRenderer1 = ({ title, subtitle, resultSet, error, chartHelpContextKey, vizState, vizOptions, pageOptions, onPageOptionsChange, widgetName, pgIndx, setPgIndx, search, setSearch, setPageOptions, selectedColumnsInitial ,hidefooter, setHidefooter}) => {
  const { query } = vizState;
  const { heightUnits, disableServerSidePaging, columns: columnsDef, download } = vizOptions;
  const { showReport } = useYADialog();
  let navigate = useNavigate()
  let location = useLocation()

  const [controller,] = useAppController();
  const { appDef: { settings } } = controller;
  const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

  const [showOptions, setShowOptions] = useState(false);
  const [state,] = useDashboardContext();

  const queryColumns = columnsDef?.filter(c => pageOptions.selectedColumns?.includes(c.name));

  const { cubejsApi } = useContext(CubeContext);
  const [subChartQueryResults, setSubChartQueryResults] = useState(null);
  const subChartColumns = columnsDef?.filter((c) => c.type === "graph");
  const hasSubCharts = subChartColumns && subChartColumns.length > 0;
  const [subChartError, setSubChartError] = useState(null);

  useEffect(() => {
    if (hasSubCharts) {
      const subChartQueryRequests = subChartColumns?.map((c) => loadQuery(cubejsApi, c, query));

      Promise.all(subChartQueryRequests)
        .then(responses => {
          let subChartQueryResultsValue = {};
          responses?.forEach(r => {
            subChartQueryResultsValue[r.name.replace(/\./g, "__")] = r;
          });
          setSubChartQueryResults(subChartQueryResultsValue);
        })
        .catch(err => {
          setSubChartError(err);
        });
    }

  }, [columnsDef, query]);

  useEffect(()=>{
   setPgIndx(null)
  },[resultSet.loadResponse.pivotQuery.filters])
  
  const loading = !resultSet;
  const subQueriesLoading = hasSubCharts && !subChartQueryResults

  if (error || subChartError) {
    return <ErrorBox error={error || subChartError} />
  }

  if (loading || subQueriesLoading)
    return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>

  let currentFilters
  currentFilters = removeSessionFilter(resultSet.loadResponse.pivotQuery.filters, vizOptions)

  const cardHeight = heightUnits ? (heightUnits * 56) + ((heightUnits - 1) * 8) : null;

  const containerMaxHeight = cardHeight ? cardHeight - 176 : null;

  const columns = queryColumns?.filter((col) => !col.hidden).map(
    (c) => ({
      Header: c.displayName,
      type: c.type,
      accessor: c.name.replace(/\./g, "__"),
      align: (c.type === "number" || c.type === "currency" || c.type === "variance" || c.type === "graph") ? "right" : c.align || "left",
      disableSorting: (c.type === "graph") ? true : c.disableSorting || false,
      Cell: ({ row: { original }, cell: { value } }) => {
        if (c.type === "number") {
          return <MDTypography key={c.name.replace(/\./g, "__")} variant="caption" color="dark" fontWeight={c.emphasize && "medium"}>{numeral(normalizeCurrency(value)).format('0,0')}</MDTypography>
        }
        else if (c.type === "currency") {
          return <MDTypography key={c.name.replace(/\./g, "__")} variant="caption" color="dark" fontWeight={c.emphasize && "medium"}>{numeral(normalizeCurrency(value)).format('$0,0')}</MDTypography>
        }
        else if (c.type === "date")
          return <MDTypography key={c.name.replace(/\./g, "__")} variant="caption" color="dark" fontWeight={c.emphasize && "medium"}>{value ? moment(value).format(defaultDateFormat || c.format) : ""}</MDTypography>
        else if (c.type === "boolean")
          return <MDTypography key={c.name.replace(/\./g, "__")} variant="caption" color="dark" fontWeight={c.emphasize && "medium"}>{value === true ? "Yes" : "No"}</MDTypography>
        else if (c.type === "variance") {
          if (c.variant === "dot")
            return <MDTypography key={c.name.replace(/\./g, "__")} variant="caption" color="dark" fontWeight={c.emphasize && "medium"} display="flex" alignItems="center" justifyContent="flex-end">{numeral(!value ? 0 : normalizeCurrency(value)).format('$0,0')}<MDBox ml={0.8} sx={({ palette: { success, error } }) => ({ height: 10, width: 10, borderRadius: "50%", backgroundColor: Number(value) <= 0 ? success.main : error.main })}></MDBox></MDTypography>
          else if (c.variant === "text")
            return <>{Number(value) <= 0 ? <Icon color="success">arrow_downward</Icon> : <Icon color="error">arrow_upward</Icon>} &nbsp;&nbsp;<MDTypography key={c.name.replace(/\./g, "__")} variant="caption" color="dark" fontWeight={c.emphasize && "medium"}>{numeral(!value ? 0 : normalizeCurrency(value)).format('$0,0')}</MDTypography></>
          return <MDBadge container circular key={c.name.replace(/\./g, "__")} badgeContent={numeral(normalizeCurrency(value)).format('$0,0')} color={Number(value) <= 0 ? "success" : "error"} variant="gradient" size="xs" />
        }
        else if (c.type === "calculated") {
          const result = parseTableColumnValue(c, original);
          if (c.trendColumn) {
            let trendValueDirectionUpVal = (result.originalValue && result.originalValue > 0);
            const trendColor = c.trendColumn.negateColorLogic ?
              (trendValueDirectionUpVal ? "error" : "success")
              :
              (trendValueDirectionUpVal ? "success" : "error");

            return <>
              {result.originalValue !== null && <Icon color={trendColor} sx={{ mx: .5, lineHeight: "18px" }}>{trendValueDirectionUpVal ? 'arrow_upward' : 'arrow_downward'}</Icon>}
              <MDTypography key={c.name.replace(/\./g, "__")} variant="caption" color={"dark"} fontWeight={c.emphasize && "medium"}>
                {result.value}
              </MDTypography>
            </>;
          }
          return <MDTypography key={c.name.replace(/\./g, "__")} variant="caption" color={"dark"} fontWeight={c.emphasize && "medium"}>{result.value}</MDTypography>
        }
        else if (c.type === "graph") {
          const { filteredRow, data: { resultSet } } = value;
          const { vizState: { chartType }, vizOptions } = c;
          return resultSet ? <SubChartRenderer key={c.name.replace(/\./g, "__")} chartType={chartType} tableRow={filteredRow} resultSet={resultSet} vizOptions={vizOptions} /> : <></>
        }
        if (c.avatar) {
          return <MDTypography key={c.name.replace(/\./g, "__")} variant="caption" display="flex" color="dark" alignItems="center" justifyContent="flex-start" fontWeight={c.emphasize && "medium"}><MDAvatar name={value} size="xs" sx={{ mr: .75 }} />{value}</MDTypography>
        }
        return <MDTypography key={c.name.replace(/\./g, "__")} variant="caption" color="dark" fontWeight={c.emphasize && "medium"}>{value}</MDTypography>
      }

    })
  );

  const tableDimensions = resultSet.loadResponse?.pivotQuery?.dimensions;

  let i = 1;
  let rows = [];
  if (isTimeDimensionQuery(vizState.query)) {
    const vizResult = parseAndMergeTableResultset(resultSet, state, vizOptions)
    rows = vizResult?.map(row => {
      row[vizOptions.measure1] = row[vizOptions.measure1] ? row[vizOptions.measure1] : 0;
      row[vizOptions.measure2] = row[vizOptions.measure2] ? row[vizOptions.measure2] : 0;
      row.variance = Math.round(row[vizOptions.measure1]  - row[vizOptions.measure2]);
      if(isNaN(row.variance)) row.variance = 0
      let r = {};
      Object.keys(row).forEach(key => r[key.replace(/\./g, "__")] = row[key]);
      return r;
    });
  }
  else {
    rows = resultSet?.tablePivot().map((row) => {
      if (i === 1 && vizOptions.changeMonths) {
        let months = row["Months.allMonths"].split(",")
        columns.splice(columns.findIndex(item => item.Header == "Months"), 1);
        months.map((mth, idx) => {
          columns[columns.findIndex(item => item.Header == idx + 1)].Header = mth;
        });
        i = 0;
      }
      let r = {};
      resultSet.tableColumns().forEach((c) => {
        if (c.key !== queryColumns?.filter((col) => col.hidden).name)
          r[c.key.replace(/\./g, "__")] = row[c.key];
      });
      if (hasSubCharts && subChartQueryResults) {
        const filteredRow = _.pick(row, tableDimensions)
        Object.keys(subChartQueryResults).forEach(k => {
          r[k] = ({ filteredRow, data: subChartQueryResults[k] });
        });
      }
      return r;
    });
  }

  const _onRowClick = (e, row) => {

    // reverted to fix issue (CT-1714) to be tested further - KS pls retest this block
    const currentFilterNames = currentFilters.map(f => f.name);
    var obj = Object.assign([], [...currentFilters]);
    vizOptions.params.filter((col) => pageOptions.selectedColumns?.includes(col) && currentFilterNames?.includes(col)).forEach((col) => _.remove(obj, { name: col }))
    vizOptions.params.filter((col) => pageOptions.selectedColumns?.includes(col)).forEach((col) => obj.push({ "name": col, "values": [getValue(row, col)] }))
    if (vizOptions["popupTo"] && row.values["Months__month"]) {
      if (obj.find((({ name }) => name === "Months.month"))) {
        _.remove(obj, { name: "Months.month" })
        obj.push({ name: "Months.month", "values": [row.values["Months__month"]] })
      }
    }
    var popupkey = ""
    var popupTo = vizOptions["popupTo"] ? vizOptions["popupTo"] : ''
    if (vizOptions["popupToKey"]) {
        popupkey = obj.find((({ name }) => name === vizOptions["popupToKey"])) ? obj.find((({ name }) => name === vizOptions["popupToKey"])).values[0] : ''
        popupTo =  vizOptions["popupTo"] ? vizOptions["popupTo"].replace("changeme",popupkey.toLowerCase()).replace(' ','') : ''
    }
    if (vizOptions.queryType && (vizOptions.queryType === "CompareWithPrevYearTrend" || vizOptions.queryType === "CompareWithPrevYearTrendFiltered") && vizOptions["popupTo"] && vizOptions["popupTo"] !== "") {
      if (obj.find((({ name }) => name === "Years.year")))
        _.remove(obj, { name: "Years.year" })
      obj.unshift({ name: "Years.year", "values": [sessionStorage["Year"]] })
    }
    if (vizOptions.excludeFilters && vizOptions.excludeFilters.length > 0) {
      vizOptions.excludeFilters.map((fil) => {
        if (obj.find((({ name }) => name === fil)))
          _.remove(obj, { name: fil })
      })
    }
    vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.drillTo : getDrilldownPath(location.pathname, vizOptions.drillTo), { state: obj })
    vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && (vizOptions["popupToKey"] ? showReport(popupTo, obj, null) : showReport(vizOptions["popupTo"], obj, null));
  };

  const bindOnClick = vizOptions["drillTo"] || vizOptions["popupTo"];

  const handleOnOptionsClick = () => {
    setShowOptions(true);
  }
  const handleOnOptionsClose = () => {
    setShowOptions(false);
  }

  const handleOnOptionsApply = (selectedColumnIds) => {
    if (setPgIndx) {
      setPgIndx(null)
    }
    onPageOptionsChange({ ...pageOptions, selectedColumns: selectedColumnIds })
  }

  const nodata = !rows?.length > 0;
  const handleCsvExport = () => {
    if (columns && rows) {
      var data = [];
      rows.forEach(element => {
        let obj = {}
        columns.forEach((e) => {
          if (e.type === 'date' && element[e.accessor] !== null) {
            element[e.accessor] = moment(element[e.accessor]).format(defaultDateFormat);
          }
          obj[e.Header] = element[e.accessor]
        })
        data.push(obj)
      });
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, 'test')
      XLSX.writeFile(wb, `${title} ${moment(Date()).format("YYYYMMDDHHmmss")}.csv`)
    }
  }

  const previousPage = () => {
    onPageOptionsChange({ ...pageOptions, currentPage: pageOptions.currentPage === 0 ? 0 : pageOptions.currentPage - 1 })
  };

  const nextPage = () => {
    onPageOptionsChange({ ...pageOptions, currentPage: pageOptions.currentPage + 1 })
  };

  let canPreviousPage = rows?.length > 0 && pageOptions?.currentPage > 0;
  let canNextPage = rows?.length > 0 && rows?.length > pageOptions?.pageSize;

  let handlePageNav = (row) => {
    setHidefooter(row?.length === 0);
    canPreviousPage = row?.length > 0;
    canNextPage = row?.length > 0;
  }
  let handlePageOption = () => {
    setPageOptions({ selectedColumns: selectedColumnsInitial, currentPage: 0, pageSize: vizOptions.defaultPageSize || 20 })
  }
  var canDownload = download ? true : false
  var isTable = vizState.chartType === "table"? true : false
  return <DashboardItem nodata={nodata} table title={title} download={canDownload} isTable={isTable} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} onCsvExport={handleCsvExport}>
    <>
      <DataTable
        variant="tile"
        table={{ columns, rows }}
        containerMaxHeight={containerMaxHeight}
        newStyle1={true}
        showTotalEntries={true}
        isSorted={true}
        noEndBorder
        entriesPerPage={true}
        pageSizeVal={pageOptions?.pageSize}
        serverSidePaging={!disableServerSidePaging}
        canSearch={true}
        onRowClick={bindOnClick && _onRowClick}
        onOptionsClick={vizOptions.hideColumnOptions ? '' : handleOnOptionsClick}
        setPgIndx={setPgIndx}
        pgIndx={pgIndx}
        srch={search}
        setSrch={setSearch}
        handlePageNav={handlePageNav}
        onPageOptionsChange={onPageOptionsChange}
        handlePageOption={handlePageOption}
      >
      </DataTable>
      {(!hidefooter && !disableServerSidePaging) && (
        <MDBox
          display="flex"
          flexDirection={{ xs: "row", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          margin={{ lg: 1.3, md: 1.3 }}
          px={{ lg: 3, md: 3, sm: 0, xs: 0 }}
          py={1.5}
        >
          <MDBox>
            <MDPagination variant={""} color="secondary" active>
              <MDPagination item onClick={() => !canPreviousPage ? null : previousPage()} disabled={!canPreviousPage} active pointerAction="auto"  >
                <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
              </MDPagination>
              <MDBox display="flex">
                <MDTypography variant="button" color="secondary" width="100%" height="100%" mx={1}>
                  {pageOptions.currentPage + 1}
                </MDTypography>
              </MDBox>
              <MDPagination item onClick={() => !canNextPage ? null : nextPage()} disabled={!canNextPage} active pointerAction="auto">
                <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
              </MDPagination>
            </MDPagination>
          </MDBox>
          <MDBox display="flex" alignItems="center" justifyContent="right">
            <MDTypography variant="caption" color="secondary">
              &nbsp;&nbsp;Rows per page:
            </MDTypography>
            <Autocomplete
              disableClearable
              value={pageOptions?.pageSize}
              options={entries}
              onChange={(event, newValue) => {
                onPageOptionsChange({ currentPage: 0, pageSize: parseInt(newValue) })
              }}
              getOptionLabel={option => option?.toString()}
              size="small"
              sx={{ width: "4rem" }}
              renderInput={(params) => <MDInput sx={(theme) => chipStyles(theme)} {...params} />}
            />
          </MDBox>
        </MDBox>
      )
      }
    </>
    {showOptions && (
      <ColumnOptions
        columnsDef={columnsDef}
        selectedColumnsInitial={pageOptions.selectedColumns}
        widgetName={widgetName}
        onOptionsClose={handleOnOptionsClose}
        onOptionsApply={handleOnOptionsApply}
      />
    )}
  </DashboardItem>;
}

export default TableRenderer;