import React, { useMemo, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useTable, usePagination, useRowSelect, useGlobalFilter, useFilters, useAsyncDebounce, useSortBy, useExpanded } from "react-table";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDPagination from "../MDPagination";
import DataTableHeadCell from "./DataTableHeadCell";
import DataTableBodyCell from "./DataTableBodyCell";
import { Checkbox, TableCell, Tooltip, MenuItem, CircularProgress } from "@mui/material";
import { useDashboardItem } from "../DashboardItem";
import YAScrollbar from "../YAScrollbar";
import Autocomplete from '@mui/material/Autocomplete';
import { useImmer } from "use-immer";
import moment from "moment";
import FilterChip from "../FilterChip";
import EmptyState from "../EmptyState";
import FilterSelector from "../FilterSelector";
import MDButton from "../MDButton";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef()
    const resolvedRef = ref || defaultRef

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <>
        <Checkbox
          ref={resolvedRef}
          color="primary"
          sx={{
            p: 0,
            "& .MuiSvgIcon-root": {
              height: 18,
              width: 18,
              border: "1px solid #c5c9cc"
            }
          }}
          {...rest}
        />
      </>
    )
  }
)

const filterTypeLabels = {
  eq: "is equal to",
  ne: "is not equal to",
  contains: "contains",
  notContains: "does not contain",
  startsWith: "starts with",
  endsWith: "ends with",
  set: "is set",
  notSet: "is not set",
  gt: "is greater than",
  gte: "is greater than or equal to",
  lt: "is less than",
  lte: "is less than or equal to",
  between: "is in between",
  notBetween: "is not in between",
  before: "is before",
  after: "is after",
};

const filterTypes = {
  string: [
    "contains"
  ],
  number: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "notBetween"],
  float: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "notBetween"],
  integer: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "notBetween"],
  currency: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "notBetween"],
  date: [
    "eq",
    "ne",
    "before",
    "after",
    "between",
    "notBetween",
  ],
};

export const getOperatorOptions = (dataType) => {
  return filterTypes[dataType]?.map((f) => (
    <MenuItem key={f} value={f}>
      {filterTypeLabels[f]}
    </MenuItem>
  ));
};

function DefaultColumnFilter({
  column: { accessor, Header, filterValue, preFilteredRows, id, setFilter, onFilterDelete, dataType },
}) {
  const [searchVal, setSearchVal] = useState('')
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach(row => {
      if ((row.original[id] || "") !== "") options.add(row.original[id])
    })
    return [...options.values()]
  }, [id, preFilteredRows])

  const handleOnFilterDelete = () => {
    setFilter()
    if (onFilterDelete)
      onFilterDelete(id)
  }

  const handleOnFilterSave = (filter) => {
    setFilter(filter);
  }

  const handleSearch = (value) => {
    setSearchVal(value)
    return searchVal
  }

  return (
    <FilterChip dataType={dataType || "string"} openOnMount={!filterValue ? true : false} name={accessor} field={Header} filterValue={filterValue} options={options} onSearchVal={handleSearch} searchVal={searchVal} onFilterDelete={handleOnFilterDelete} onFilterSave={handleOnFilterSave} />
  )
}

const checkFilter = (filter, rowValue) => {
  const fType = filter?.type || 'string';
  const fOperator = filter?.operator || 'eq';
  const fValue = filter?.values || [];
  if (rowValue === undefined || fValue.length === 0)
    return true

  if (['integer', 'float', 'currency'].includes(fType)) {
    if (fOperator === 'ne') {
      return Number(rowValue) !== Number(fValue[0]);
    }
    else if (fOperator === 'gt') {
      return Number(rowValue) > Number(fValue[0]);
    }
    else if (fOperator === 'gte') {
      return Number(rowValue) >= Number(fValue[0]);
    }
    else if (fOperator === 'lt') {
      return Number(rowValue) < Number(fValue[0]);
    }
    else if (fOperator === 'lte') {
      return Number(rowValue) <= Number(fValue[0]);
    }
    else if (fOperator === 'between') {
      return Number(rowValue) >= Number(fValue[0]) && Number(rowValue) <= Number(fValue[1]);
    }
    else if (fOperator === 'notBetween') {
      return Number(rowValue) < Number(fValue[0]) && Number(rowValue) > Number(fValue[1]);
    }
    return Number(rowValue) === Number(fValue[0]);
  }
  else if (fType === 'datepicker') {
    if (fOperator === 'ne') {
      return !moment(rowValue, "YYYY-MM-DD").isSame(moment(fValue[0], "YYYY-MM-DD", true));
    }
    else if (fOperator === 'before') {
      return moment(rowValue, "YYYY-MM-DD").isBefore(moment(fValue[0], "YYYY-MM-DD", true));
    }
    else if (fOperator === 'after') {
      return moment(rowValue, "YYYY-MM-DD").isAfter(moment(fValue[0], "YYYY-MM-DD", true));
    }
    else if (fOperator === 'between') {
      return moment(rowValue, "YYYY-MM-DD").isSameOrAfter(moment(fValue[0], "YYYY-MM-DD", true)) && moment(rowValue, "YYYY-MM-DD").isSameOrBefore(moment(fValue[1], "YYYY-MM-DD", true));
    }
    else if (fOperator === 'notBetween') {
      return moment(rowValue, "YYYY-MM-DD").isBefore(moment(fValue[0], "YYYY-MM-DD", true)) && moment(rowValue, "YYYY-MM-DD").isAfter(moment(fValue[1], "YYYY-MM-DD", true));
    }
    return moment(rowValue, "YYYY-MM-DD").isSame(moment(fValue[0], "YYYY-MM-DD", true));
  }
  else if (fType === 'string') {
    return String(rowValue || "")
      .toLowerCase()
      .includes(String(fValue[0] || "").toLowerCase())
  }

  return fValue.includes(rowValue)
}

function DataTable({
  variant,
  entriesPerPage,
  hideFooterForMinRecords,
  loading,
  canSearch,
  canFilter,
  filtersState,
  onFiltersStateUpdate,
  showTotalEntries,
  table,
  pagination,
  serverSidePaging,
  pageSizeVal,
  isSorted,
  noEndBorder,
  bordered,
  isSelectable,
  idColumnName,
  onRowClick,
  onUpdate,
  newStyle1,
  deleteMultiple,
  onDeleteMultiple,
  onOptionsClick,
  onSelectionClearClick,
  containerMaxHeight,
  primaryActions,
  filtersComponent,
  renderRowSubComponent,
  pgIndx,
  setPgIndx,
  srch,
  setSrch,
  handlePageNav,
  onPageOptionsChange,
}) {

  const defaultValue = pageSizeVal || 20;
  const entries = entriesPerPage.entries
    ? entriesPerPage.entries.map((el) => el.toString())
    : [20, 30, 40, 50];
  const columns = useMemo(() => table.columns?.filter(c => !c.hidden), [table]);
  const data = useMemo(() => table.rows, [table]);

  const [filters, setFilters] = useImmer(filtersState?.filters?.map(f => f.id) || []);

  const handleOnFilterDelete = (selectedFilterName) => {
    setFilters((draft) => draft.filter(f => f !== selectedFilterName));
  };

  const dashboardItemContext = useDashboardItem();

  if (dashboardItemContext && dashboardItemContext.fullscreen)
    containerMaxHeight = "calc(100vh - 224px)";

  const defaultColumn = useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
      filter: 'custom',
      onFilterDelete: handleOnFilterDelete
    }),
    []
  )

  const filterTypes = useMemo(
    () => ({
      custom: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.original[id];
          return checkFilter(filterValue, rowValue);
        });
      },
    }),
    []
  )

  const tableInstance = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: { pageIndex: pgIndx && !serverSidePaging ? pgIndx : 0, pageSize: defaultValue || 20, globalFilter: filtersState?.globalFilter, filters: filtersState?.filters || [] },
      autoResetGlobalFilter: false,
      filterTypes,
      autoResetFilters: false,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => {

        let newColumns = [];

        if (isSelectable) {
          newColumns.push(
            // Let's make a column for selection
            {
              id: 'selection',
              // The header can use the table's getToggleAllRowsSelectedProps method
              // to render a checkbox
              Header: ({ getToggleAllPageRowsSelectedProps }) => (
                <div>
                  <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
                </div>
              ),
              // The cell can use the individual row's getToggleRowSelectedProps method
              // to the render a checkbox
              Cell: ({ row }) => (
                <div>
                  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                </div>
              ),
              disableSorting: true
            }
          );
        }

        return [
          ...newColumns,
          ...columns,
        ]
      })
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    pageOptions,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    globalFilteredRows,
    setGlobalFilter,
    setAllFilters,
    toggleAllRowsSelected,
    state: { pageIndex, pageSize, selectedRowIds, globalFilter, filters: tableFilters },
  } = tableInstance;

  const prevpage = () => {
    if (setPgIndx && !serverSidePaging) {
      canPreviousPage ? pageIndex !== 0 ? setPgIndx(pageIndex - 1) : setPgIndx(pageIndex) : ''
    }
    previousPage()
  }
  const nextpg = () => {
    if (setPgIndx && !serverSidePaging) {
      canNextPage ? setPgIndx(pageIndex + 1) : ''
    }
    nextPage()
  }

  let filteredRows = globalFilteredRows.map(r => r?.original[idColumnName]);
  let selectedRows = selectedFlatRows.map(r => r?.original[idColumnName]);

  useEffect(() => {
    if (isSelectable && onUpdate) onUpdate({ selected: selectedFlatRows.map(r => r?.original[idColumnName])});
  }, [onUpdate, selectedRowIds]);

  // Set the default value for the entries per page when component mounts
  useEffect(() => setPageSize(defaultValue || 20), [defaultValue]);

  // Set the entries per page value based on the select value
  const setEntriesPerPage = (value) => {
    setPageSize(value)
    onPageOptionsChange ? onPageOptionsChange({ currentPage: 0, pageSize: parseInt(value) }) : ''
    if (setPgIndx && !serverSidePaging) {
      setPgIndx(null)
    }
  };

  // Render the paginations
  const renderPagination = pageOptions.map((option) => (
    <MDPagination
      item
      size="small"
      key={option}
      onClick={() => gotoPage(Number(option))}
      active={pageIndex === option}
    >
      {option + 1}
    </MDPagination>
  ));

  // Handler for the input to set the pagination index
  const handleInputPagination = ({ target: { value } }) =>
    value > pageOptions.length || value < 0 ? gotoPage(0) : gotoPage(Number(value));

  // Customized page options starting from 1
  const customizedPageOptions = pageOptions.map((option) => option + 1);

  // Setting value for the pagination input
  const handleInputPaginationValue = ({ target: value }) => gotoPage(Number(value.value - 1));

  // Search input value state
  const [search, setSearch] = useState(globalFilter);

  // Search input state handle
  const onSearchChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 100);

  useEffect(() => {
    if (onFiltersStateUpdate)
      onFiltersStateUpdate(globalFilter, canFilter ? tableFilters : []);
  }, [globalFilter, tableFilters]);

  // A function that sets the sorted value for the table
  const setSortedValue = (column) => {
    let sortedValue;

    // if (isSorted && column.isSorted) {
    if (column.isSorted) {
      sortedValue = column.isSortedDesc ? "desc" : "asce";
    }
    else if (isSorted) {
      sortedValue = "none";
    }
    else {
      sortedValue = "asce";
    }

    return sortedValue;
  };

  // Setting the entries starting point
  const entriesStart = pageIndex === 0 ? pageIndex + 1 : pageIndex * pageSize + 1;

  // Setting the entries ending point
  let entriesEnd;

  if (pageIndex === 0) {
    entriesEnd = pageSize;
  } else if (pageIndex === pageOptions.length - 1) {
    entriesEnd = rows.length;
  } else {
    entriesEnd = pageSize * (pageIndex + 1);
  }

  if (entriesEnd >= rows.length) {
    entriesEnd = rows.length;
  }

  const handleOnFilterSelect = (selectedFilter) => {
    setFilters((draft) => {
      draft.push(selectedFilter.accessor);
    });
  };

  const handlesearch = (value) => {
    if (setSrch && !serverSidePaging) {
      setSrch(value)
      setPgIndx(null)
    }
  }

  useEffect(() => {
    if (srch && !serverSidePaging) {
      toggleAllRowsSelected(false)
      setSearch(srch);
      onSearchChange(srch);
    }
  }, []);

  useEffect(() => {
    if (handlePageNav && !serverSidePaging)
      handlePageNav(rows)
  }, [rows]);


  let headers = [];
  headerGroups.forEach((headerGroup) => headers.push(...headerGroup.headers));

  const toolbarPadding = (variant === "tile" || variant === "subtable") ? { pr: 3, pl: 2.5, py: 1 } : { p: 2.5 }
  const footerPadding = !showTotalEntries && pageOptions.length === 1 ? { p: 0 } : (variant === "tile" || variant === "subtable") ? { px: { lg: 3, md: 3, sm: 0, xs: 0 }, py: 1.5 } : { p: 3 };

  const availableFields = columns?.filter(f => !f.disableFilters && !filters.includes(f.accessor)) || [];
  const filtersApplied = filtersComponent || (search || "") !== "" || filters?.length > 0;

  const chipStyles = ({ palette: { white } }) => ({
    cursor: 'pointer',
    backgroundColor: white,
    "& .MuiOutlinedInput-notchedOutline": { border: 'none' },
  })

  let text = search || filters.length > 0 ? "Delete all searched  " + rows.length + "  records" : "Delete all  " + rows.length + "  records"
  return (
    <>
      {canSearch ? (
        <MDBox display="flex" justifyContent="space-between" alignItems="center"  {...toolbarPadding}>
          <MDBox display="flex" flex={1} justifyContent="flex-start" alignItems="center" flexWrap="wrap">
            {canSearch && !newStyle1 && (
              <MDInput
                placeholder="Search..."
                inputProps={{ type: "search" }}
                value={search || ''}
                size="small"
                sx={{ width: "100%", minWidth: "10rem", maxWidth: "20rem", margin: .5 }}
                onChange={({ currentTarget }) => {
                  toggleAllRowsSelected(false)
                  setSearch(currentTarget.value);
                  onSearchChange(currentTarget.value);
                  handlesearch(currentTarget.value)
                }}
              />
            )}
            {canSearch && newStyle1 && (
              <>
                <Icon fontSize="small">search</Icon>
                <MDInput
                  placeholder="Search..."
                  inputProps={{ type: "search" }}
                  value={search}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline, &:before": {
                      border: "none"
                    },
                  }}
                  onChange={({ currentTarget }) => {
                    toggleAllRowsSelected(false)
                    setSearch(currentTarget.value);
                    onSearchChange(currentTarget.value);
                    handlesearch(currentTarget.value)
                  }}
                />
              </>

            )}
            {filtersComponent && filtersComponent}
            {canFilter && (
              <>
                {
                  filters?.map((f) => {
                    const column = headers?.find(c => c.id === f);
                    if (column)
                      return column.canFilter ? column.render('Filter') : null;
                    else
                      return null;
                  })
                }
                <FilterSelector fields={availableFields} onFilterSelect={handleOnFilterSelect} />
                {tableFilters?.length > 1 &&
                  <MDButton
                    disableRipple
                    size="large"
                    startIcon={<Icon fontSize="medium">clear</Icon>}
                    sx={{ height: 32, ml: .5, textTransform: 'none', fontSize: 13, p: 1.5 }}
                    variant="text"
                    color="text"
                    onClick={() => {
                      setAllFilters([]);
                      setFilters([]);
                    }}
                  >
                    Clear
                  </MDButton>
                }
              </>
            )}
          </MDBox>
          {(isSelectable && Object.keys(selectedRowIds)?.length > 0) && rows.length > 0 && (
            <>
              {
                deleteMultiple && (
                  <MDButton onClick={() => onDeleteMultiple(selectedRows)} color="error" variant="outlined">{`Delete Selected ${Object.keys(selectedRowIds).length}`}</MDButton>

                )}
              {(!deleteMultiple && <MDTypography ml={1} mr={2.5} color="info" variant="button" fontWeight="medium">{`Selected (${Object.keys(selectedRowIds).length})`}</MDTypography>)}

              {
                onSelectionClearClick && (
                  <MDTypography display="inline-flex" component="a" href="#" mr="auto" color="error" variant="button" fontWeight="medium" onClick={onSelectionClearClick}><Icon fontSize="small" color="error">close</Icon>&nbsp;Clear</MDTypography>
                )
              } &nbsp;&nbsp;
              {
                deleteMultiple && pageOptions.length && (
                  <MDButton onClick={() => onDeleteMultiple(filteredRows)} color="error" variant="outlined">{text}</MDButton>
                )}
            </>
          )}
          {onOptionsClick && (
            <MDBox display="flex" color="text" pt={0.3}>
              <Tooltip title="Show / Hide columns">
                <Icon color="text" sx={{ cursor: "pointer", fontWeight: "normal" }} fontSize="medium" onClick={onOptionsClick ? () => onOptionsClick() : undefined}>
                  filter_list
                </Icon>
              </Tooltip>
            </MDBox>
          )}
          {primaryActions && (primaryActions)}
        </MDBox>
      ) : null}
      <TableContainer sx={
        containerMaxHeight ? { boxShadow: "none", height: containerMaxHeight } : { boxShadow: "none" }
      }>
        <YAScrollbar disableShadows variant="table">
          {
            loading &&
            <MDBox position="absolute" sx={{ inset: 0, backdropFilter: "blur(1px)" }} display="flex" alignItems="center" justifyContent="center">
              <CircularProgress size={40} sx={{ marginTop: 1 }} color="info" />
            </MDBox>
          }
          {
            rows.length === 0 &&
            <MDBox display="flex" alignItems="center" justifyContent="center" height="100%">
              <EmptyState
                variant="info"
                size="smallMed"
                iconName="find_in_page"
                title={filtersApplied ? "No records were found to match your search" : "No records found"}
                description={filtersApplied ? "Try modifying your search criteria" : ""}
              />
            </MDBox>
          }
          {
            rows.length > 0 &&
            <Table {...getTableProps()} stickyHeader>
              <TableHead>
                {headerGroups.map((headerGroup) => (
                  <TableRow key={"TableHeader"} {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <DataTableHeadCell
                        key={column.id}
                        {...column.getHeaderProps(isSorted && column.getSortByToggleProps())}
                        variant={variant}
                        width={column.width ? column.width : "auto"}
                        align={column.align ? column.align : "left"}
                        disableSorting={column.disableSorting}
                        sorted={column.isSorted}
                        sortedBy={setSortedValue(column)}
                        bordered={bordered}
                      >
                        {column.render("Header")}
                      </DataTableHeadCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody {...getTableBodyProps()}>
                {page.map((row, key) => {
                  prepareRow(row);
                  return (
                    <>
                      <TableRow
                        {...row.getRowProps()}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            cursor: onRowClick ? "pointer" : "default"
                          }
                        }}
                        onClick={onRowClick ? (e) => onRowClick(e, row, columns) : undefined}
                      >
                        {row.cells.map((cell) => cell.column.isHeader ? (
                          <DataTableHeadCell
                            key={key}
                            bordered={bordered}
                            disableSorting={true}
                            sorted={false}
                            noBorder={noEndBorder && rows.length - 1 === key}
                            align={cell.column.align ? cell.column.align : "left"}
                            {...cell.getCellProps()}
                          >
                            {cell.render("Cell")}
                          </DataTableHeadCell>
                        ) : (
                          <DataTableBodyCell
                            key={key}
                            bordered={bordered}
                            noBorder={noEndBorder && rows.length - 1 === key}
                            align={cell.column.align ? cell.column.align : "left"}
                            {...cell.getCellProps()}
                          >
                            {cell.render("Cell")}
                          </DataTableBodyCell>
                        )
                        )}
                      </TableRow>
                      {/*
                    If the row is in an expanded state, render a row with a
                    column that fills the entire length of the table.
                  */}
                      {row.isExpanded && (
                        <TableRow>
                          <TableCell
                            colSpan={columns?.length}
                            sx={({ palette: { light }, borders: { borderWidth } }) => ({
                              border: "none",
                              borderBottom: `${borderWidth[1]} solid ${light.main}`,
                              maxWidth: 300,
                              px: 2,
                              pt: 1,
                              pb: 3
                            })}
                          >
                            <YAScrollbar variant="table">
                              {renderRowSubComponent({ row })}
                            </YAScrollbar>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          }
        </YAScrollbar>
      </TableContainer>
      {!serverSidePaging && <>
        {
          !((hideFooterForMinRecords && rows.length < 20) || rows.length === 0) && !newStyle1 && (
            <MDBox
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              {...footerPadding}
            >
              {entriesPerPage && (
                <MDBox display="flex" alignItems="center">
                  <Autocomplete
                    disableClearable
                    value={pageSize}
                    options={entries}
                    onChange={(event, newValue) => {
                      setEntriesPerPage(parseInt(newValue));
                    }}
                    getOptionLabel={option => option?.toString()}
                    size="small"
                    sx={{ width: "5rem" }}
                    renderInput={(params) => <MDInput {...params} />}
                  />
                  <MDTypography variant="caption" color="secondary">
                    &nbsp;&nbsp;rows per page
                  </MDTypography>
                </MDBox>
              )}
              {showTotalEntries && (
                <MDBox mb={{ xs: 3, sm: 0 }}>
                  <MDTypography variant="button" color="secondary" fontWeight="regular">
                    Showing {entriesStart} to {entriesEnd} of {rows.length}{variant === "page" && " rows"}
                  </MDTypography>
                </MDBox>
              )}
              {pageOptions.length > 1 && (
                <MDPagination
                  variant={pagination.variant ? pagination.variant : "gradient"}
                  color={pagination.color ? pagination.color : "info"}
                >
                  {(variant === "tile" || variant === "subtable") ? (
                    <MDPagination item onClick={() => prevpage()} disabled={!canPreviousPage}>
                      <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                    </MDPagination>
                  ) : canPreviousPage && (
                      <MDPagination item onClick={() => prevpage()} disabled={!canPreviousPage}>
                      <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                    </MDPagination>
                  )
                  }
                  {variant === "page" &&
                    (renderPagination.length > 6 ? (
                      <MDBox width="5rem" mx={1} textAlign="center">
                        <MDInput
                          inputProps={{ type: "number", min: 1, max: customizedPageOptions.length }}
                          value={customizedPageOptions[pageIndex]}
                          onChange={(handleInputPagination, handleInputPaginationValue)}
                        />
                      </MDBox>
                    ) : (
                      renderPagination
                    )
                    )
                  }
                  {(variant === "tile" || variant === "subtable") ? (
                    <MDPagination item onClick={() => nextpg()} disabled={!canNextPage} extraMargin>
                      <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                    </MDPagination>
                  ) : canNextPage && (
                    <MDPagination item onClick={() => nextpg()} disabled={!canNextPage}>
                      <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                    </MDPagination>
                  )
                  }
                </MDPagination>
              )}
            </MDBox>
          )
        }
        {
          !((hideFooterForMinRecords && rows.length < 20) || rows.length === 0) && newStyle1 && (
            <MDBox
              display="flex"
              flexDirection={{ xs: "row", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              margin={{ lg: 1.3, md: 1.3 }}
              {...footerPadding}
            >
              {pageOptions.length > 1 ? (
                <MDBox display="-webkit-box">
                  <MDPagination variant={""} color="secondary" active>
                    {(variant === "tile" || variant === "subtable") ? (
                      <MDPagination item onClick={() => prevpage()} disabled={!canPreviousPage} active pointerAction="auto"  >
                        <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                      </MDPagination>
                    ) : canPreviousPage && (
                      <MDPagination item onClick={() => prevpage()} disabled={!canPreviousPage} pointerAction="auto" active>
                        <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                      </MDPagination>
                    )
                    }
                    {showTotalEntries && (
                      <MDBox >
                        <MDTypography variant="button" color="secondary" width="100%" height="100%" >
                          {pageIndex + 1} of {pageOptions.length}
                        </MDTypography>
                      </MDBox>
                    )}

                    {(variant === "tile" || variant === "subtable") ? (
                      <MDPagination item onClick={() => nextpg()} disabled={!canNextPage} extraMargin active pointerAction="auto">
                        <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                      </MDPagination>
                    ) : canNextPage && (
                      <MDPagination item onClick={() => nextpg()} disabled={!canNextPage} pointerAction="auto" active>
                        <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                      </MDPagination>
                    )
                    }
                  </MDPagination>
                </MDBox>
              ) : <MDBox />}

              {entriesPerPage && (
                <MDBox display="flex" alignItems="center" justifyContent="right">
                  <MDTypography variant="caption" color="secondary">
                    &nbsp;&nbsp;Rows per page:
                  </MDTypography>
                  <Autocomplete
                    disableClearable
                    value={pageSize}
                    options={entries}
                    onChange={(event, newValue) => {
                      setEntriesPerPage(parseInt(newValue));
                    }}
                    getOptionLabel={option => option?.toString()}
                    size="small"
                    sx={{ width: "4rem" }}
                    renderInput={(params) => <MDInput sx={(theme) => chipStyles(theme)} {...params} />}
                  />

                </MDBox>
              )}

            </MDBox>
          )
        }
      </>}
    </>
  );
}

// Setting default values for the props of DataTable
DataTable.defaultProps = {
  variant: "page",
  entriesPerPage: { defaultValue: 20, entries: [20, 30, 40, 50] },
  hideFooterForMinRecords: false,
  loading: false,
  canSearch: false,
  canFilter: false,
  isSelectable: false,
  idColumnName: "id",
  showTotalEntries: true,
  pagination: { variant: "gradient", color: "info", pointerAction: "none" },
  isSorted: true,
  noEndBorder: false,
  bordered: false,
  fullscreen: false,
};

// Typechecking props for the DataTable
DataTable.propTypes = {
  variant: PropTypes.oneOf(["page", "tile", "subtable"]),
  entriesPerPage: PropTypes.oneOfType([
    PropTypes.shape({
      defaultValue: PropTypes.number,
      entries: PropTypes.arrayOf(PropTypes.number),
    }),
    PropTypes.bool,
  ]),
  hideFooterForMinRecords: PropTypes.bool,
  loading: PropTypes.bool,
  canSearch: PropTypes.bool,
  canFilter: PropTypes.bool,
  isSelectable: PropTypes.bool,
  idColumnName: PropTypes.string,
  showTotalEntries: PropTypes.bool,
  table: PropTypes.objectOf(PropTypes.array).isRequired,
  pagination: PropTypes.shape({
    variant: PropTypes.oneOf(["contained", "gradient"]),
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
    ]),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
  bordered: PropTypes.bool,
  fullscreen: PropTypes.bool,
};

export default DataTable;
