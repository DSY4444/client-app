import { useEffect, useState, useRef } from "react";

import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import { Checkbox, ClickAwayListener, Stack, TextField, MenuItem } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { useAppController } from "context";
import moment from "moment";
import numeral from "numeral";
import PopperComponent from "components/PopperComponent";
import StyledPopper from "components/StyledPopper";
import colors from "assets/theme/base/colors";
import StyledPopperSearchbox from "components/StyledPopperSearchbox";


const cubeOperatorTypes = {
    eq: "equals",
    ne: "notEquals",
    contains: "contains",
    notContains: "notContains",
    startsWith: "startsWith",
    endsWith: "endsWith",
    set: "set",
    notSet: "notSet",
    gt: "gt",
    gte: "gte",
    lt: "lt",
    lte: "lte",
    between: "inDateRange",
    notBetween: "notInDateRange",
    before: "beforeDate",
    after: "afterDate"
}

const filterTypeLabels = {
    eq: "is equal to",
    ne: "is not equal to",
    contains: "contains",
    notContains: "does not contain",
    startsWith: "starts with",
    endsWith: "ends with",
    set: "is set",
    notSet: "is not set",
    gt: "is greater than (>)",
    gte: "is greater than or equal to (>=)",
    lt: "is less than (<)",
    lte: "is less than or equal to (<=)",
    between: "is in between",
    notBetween: "is not in between",
    before: "is before",
    after: "is after",
};

const filterTypes = {
    string: [
        "eq",
        "ne",
        "contains",
        "notContains",
        "startsWith",
        "endsWith"
    ],
    number: ["eq", "gt", "gte", "lt", "lte", "between"],
    float: ["eq", "gt", "gte", "lt", "lte", "between"],
    integer: ["eq", "gt", "gte", "lt", "lte", "between"],
    currency: ["eq", "gt", "gte", "lt", "lte", "between"],
    date: [
        "eq",
        "before",
        "after",
        "between",
    ],
};

export const getOperatorOptions = (dataType) => {
    return filterTypes[dataType]?.map((f) => (
        <MenuItem key={f} value={f}>
            {filterTypeLabels[f]}
        </MenuItem>
    ));
};

const componentTypeForFieldTypeAndOperator = {
    "string": "string",
    "textbox": "textbox",
    "select": "textbox",
    "dropdown": "textbox",
    "switch": "textbox",
    "float": "float",
    "currency": "float",
    "integer": "integer",
    "date": "date",
    "datepicker": "date",
};

const filterTypeDesc = {
    eq: "",
    ne: "not equals",
    contains: "",
    notContains: "does not contain",
    startsWith: "starts with",
    endsWith: "ends with",
    set: "is set",
    notSet: "is not set",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    between: "",
    notBetween: "not in between",
    before: "Before",
    after: "After",
};

const isRangeOperator = (operatorVal) => ["between", "notBetween"].includes(operatorVal);

const getFilterDescription = (defaultDateFormat, dataType = "textbox", operator, values, valueLimit, name, options, sessionFilters) => {
    // console.log(name, options, values)

    let valueDescription = "";
    if (Array.isArray(values) && values?.length > 1) {
        if (["between", "notBetween"].includes(operator)) {
            if (dataType === "currency")
                valueDescription = `${numeral(values[0]).format('$0,0')} - ${numeral(values[1]).format('$0,0')}`;
            else if (dataType === "datepicker")
                valueDescription = `${moment(values[0]).format(
                    defaultDateFormat
                )} - ${moment(values[1]).format(defaultDateFormat)}`;
            else
                valueDescription = `${values[0]} - ${values[1]}`;
        }
        else if (valueLimit > 1 && values?.length <= valueLimit)
            valueDescription = values.slice(0, values.length - 1).join(", ") + ", " + values[values.length - 1]
        else if (name === 'Month' && sessionFilters) {
            valueDescription = options[0] !== undefined ? options[0] + " - " + values[values?.length - 1] : '';
        }
        else
            valueDescription = values[0];
    }
    else if (Array.isArray(values) && values?.length === 1) {
        if (dataType === "currency")
            valueDescription = numeral(values[0]).format('$0,0');
        else if (dataType === "datepicker")
            valueDescription = moment(values[0]).format(defaultDateFormat);
        else if (dataType === "string")
            return `Like "${values[0] || ""}"`;
        else if (name === 'Month' && sessionFilters)
            valueDescription = options[0] + " - " + values[values.length - 1];
        else valueDescription = values[0];
    }
    else if (["set", "notSet"].includes(operator)) { valueDescription = ""; }
    else if (name === 'Month' && sessionFilters) {
        valueDescription = "";
        // if (values === undefined)
        valueDescription = options[0] + " - " + options[options.length - 1];
    }
    else {
        valueDescription = "All";
    }
    return `${filterTypeDesc[operator] || ""} ${valueDescription || ""}`;

};

const chipStyles = ({ palette: { white } }, { dismissible, defaultSelected, sessionFilters, headerShadow }) => ({
    cursor: 'pointer',
    border: sessionFilters ? 'none' : !dismissible ? '1px solid #c7c4c4' : defaultSelected ? '1px solid #c7c4c4' : '1px solid #c7c4c4',
    borderRadius: 1,
    display: 'flex',
    flexDirection: 'row',
    minWidth: sessionFilters ? 0 : '120px',
    py: sessionFilters ? 1.25 : 1.63,
    pl: sessionFilters ? 0.2 : 1.25,
    margin: .5,
    mb: 1,
    mt: sessionFilters ? '' : headerShadow ? 3.3 : '',
    alignItems: 'center',
    justifyContent: 'space-between',
    whiteSpace: 'nowrap',
    fontSize: '15px',
    // background: sessionFilters ? '#ffffff' : !dismissible ? '#cbd2eb!important' : defaultSelected ? '#626480!important' : '#fafafa!important',
    backgroundColor: white,
    height: 32,
    // overflow: 'hidden',
    position: 'relative',
    "&:hover": {
        // backgroundColor: sessionFilters ? '#cacaca!important'  : !dismissible ?  '#cbd2eb!important'  : defaultSelected ? '#eaeaea'  :  '#eaeaea',
        backgroundColor: sessionFilters ? '#f3f3f3!important' : 'none',
        // "& .fil": { 
        //     backgroundColor: !dismissible ? '#cbd2eb!important' : '#eaeaea',
        //     borderRadius: 1
        // },   
    },
    "& .MuiTypography-root, & .MuiIcon-root": sessionFilters ? { color: '#435cc8!important' } : !dismissible ? { color: '#435cc8!important' } : defaultSelected ? { color: '#626480!important' } : '#eaeaea',
    "& .chipDesc": { ml: .5, py: sessionFilters ? 0.25 : 1.5, maxWidth: 180, minWidth: sessionFilters ? 0 : 120, fontSize: sessionFilters ? '15px' : '16px', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: sessionFilters ? 600 : 'normal', color: sessionFilters ? '#626480!important' : !dismissible ? '#435cc8!important' : defaultSelected ? '#3F4165!important' : '#3F4165' },
    "& .closeIcon": { height: 32, width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '15px!important', marginTop: .25, marginLeft: .25 },
    "& .fil": {
        position: 'absolute',
        top: '-1em',
        zIndex: 999,
        left: '0.30em',
        fontSize: '13px',
        backgroundColor: colors.dashboardBackground,
        color: "#83849C",
        padding: '0 3px',
        "&:hover": {
            // backgroundColor: !dismissible ? '#cbd2eb!important' : '#eaeaea',
            // borderRadius: 1
        },
    }
})

const FilterChip = (props) => {
    const { openOnMount, name, dataType, field, operator, options, optionsLoading, filterValue, onFilterDelete, onFilterSave, dismissible, defaultSelected, isCubeFilter, onSearchVal, searchVal, valueLimit, sessionFilters, headerShadow } = props;
    const [operatorVal, setOperatorVal] = useState(operator || "eq");
    const [valuesVal, setValuesVal] = useState(filterValue?.values);
    const [errors, setErrors] = useState({});
    // const [pendingValue, setPendingValue] = useState([]);

    const [controller,] = useAppController();
    const { appDef: { settings } } = controller;
    const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

    const chipRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'filter-chip' : undefined;

    let componentType = dataType ? (componentTypeForFieldTypeAndOperator[`${dataType}-${operatorVal || ""}`] || componentTypeForFieldTypeAndOperator[dataType]) : "textbox";

    const operators = getOperatorOptions(componentType);

    const isRangeOperatorVal = isRangeOperator(operatorVal);
    const valuesArr = Array.isArray(valuesVal) && valuesVal?.length === 2 ? valuesVal : [null, null];
    const value1 = isRangeOperatorVal ? valuesArr[0] : valuesVal;
    const value2 = isRangeOperatorVal ? valuesArr[1] : valuesVal;

    useEffect(() => {
        if (openOnMount)
            chipRef.current?.click();
    }, [])

    const handleChange = (e) => {
        onSearchVal(e.target.value)
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const onClickAwayCallback = (event) => {
        if (event.target.localName === 'body') {
            return;
        }
        if (anchorEl.current && anchorEl.current.contains(event.target)) {
            return;
        }
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
        if (searchVal)
            onSearchVal(null);
    };

    const handleClose = () => {
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
    };

    const validateDataType = (type, value, isRangeOperatorVal) => {
        switch (type) {
            case "string":
                return !value || typeof value === 'string' ? (value || "").trim() === "" : value?.length === 0;
            case "float":
                if (isRangeOperatorVal) {
                    if (!value || !Array.isArray(value) || value?.length !== 2)
                        return [true, true];
                    return [isNaN(parseFloat(value[0])), isNaN(parseFloat(value[1]))];
                }
                return !value || isNaN(parseFloat(value));
            case "integer":
                if (isRangeOperatorVal) {
                    if (!value || !Array.isArray(value) || value?.length !== 2)
                        return [true, true];
                    return [isNaN(parseInt(value[0])), isNaN(parseInt(value[1]))];
                }
                return !value || isNaN(parseInt(value));
            case "datepicker":
            case "date": {
                if (isRangeOperatorVal) {
                    if (!value || !Array.isArray(value) || value?.length !== 2)
                        return [true, true];
                    return [!moment(value[0], "YYYY-MM-DD", true).isValid(), !moment(value[1], "YYYY-MM-DD", true).isValid()];
                }
                return !value || !moment(value, "YYYY-MM-DD", true).isValid();
            }
        }

        return true;
    }

    const handleSaveFilter = () => {
        let errorsObj = {};
        const isRangeOperatorVal = isRangeOperator(operatorVal);
        const validDataType = ['set', 'notSet'].includes(operatorVal) ? false : validateDataType(componentType, valuesVal, isRangeOperatorVal);
        if ((!isRangeOperatorVal && validDataType) || (Array.isArray(validDataType) && validDataType.includes(true))) {
            errorsObj = {
                value1: isRangeOperatorVal ? validDataType[0] : validDataType,
                value2: isRangeOperatorVal ? validDataType[1] : validDataType,
            };
        }
        if (Object.keys(errorsObj).length === 0) {
            if (onFilterSave)
                onFilterSave({
                    type: dataType,
                    operator: !isCubeFilter ? operatorVal : cubeOperatorTypes[operatorVal],
                    values: valuesVal,
                    session: sessionFilters
                })
            handleClose();
        }

        console.error(errorsObj)
        setErrors(errorsObj);
    }

    const handleFilterOnSelection = (pendingValue) => {
        if (onFilterSave)
            onFilterSave({
                name: name,
                type: dataType,
                operator: !isCubeFilter ? operatorVal : cubeOperatorTypes[operatorVal],
                values: pendingValue,
                session: sessionFilters
            })
    }

    const handleClearFilter = () => {
        if (onFilterSave)
            onFilterSave({
                name: name,
                type: dataType,
                operator: !isCubeFilter ? operatorVal : cubeOperatorTypes[operatorVal],
                values: []
            })
        onSearchVal(null)
    }

    const handleFilterOptions = (options) => {
        return (searchVal || '') === ''
            ? options
            : options.filter((option) => (option.label || option).toLowerCase().indexOf(searchVal.toLowerCase()) > -1);
    };

    return <>
        <MDBox
            ref={chipRef}
            data-testid={field?.toLowerCase().replaceAll(' ', '')}
            aria-describedby={id}
            onClick={handleClick}
            sx={(theme) => chipStyles(theme, { dismissible, defaultSelected, sessionFilters, headerShadow })}>
            {sessionFilters ? ''
                // <MDTypography variant="caption" fontWeight="medium">{field}:</MDTypography>
                :
                <MDTypography className="fil">{field}</MDTypography>}
            {name === 'Year' ? <Icon fontSize="small">calendar_today</Icon> : name === 'Expense Type' ? <Icon fontSize="medium">payments</Icon> : ''}
            {/* <MDBox  display="flex"  flexDirection="row"  justifyContent="space-between"> */}
            <MDTypography variant="caption" className="chipDesc">{getFilterDescription(defaultDateFormat, dataType, filterValue?.operator, filterValue?.values, valueLimit, name, options, sessionFilters)}</MDTypography>
            {
                !["between", "notBetween"].includes(filterValue?.operator) && Array.isArray(filterValue?.values) && filterValue?.values.length > valueLimit && name !== "Month" &&
                <MDBadge circular badgeContent={`+${filterValue?.values.length - 1}`} color="light" size="xs"></MDBadge>
            }
            {
                dismissible &&
                <Icon className="closeIcon" onClick={(e) => { e.preventDefault(); onFilterDelete(field) }}>close</Icon>
            }
            {
                !dismissible &&
                <Icon className="closeIcon">keyboard_arrow_down</Icon>
            }
            {/* </MDBox> */}
        </MDBox>
        <StyledPopper id={id} open={open} anchorEl={anchorEl} placement="bottom-start"
            modifiers={[
                {
                    name: 'offset',
                    options: {
                        offset: [0, 4],
                    },
                },
            ]}
        >
            <ClickAwayListener onClickAway={(e) => onClickAwayCallback(e)}>
                <MDBox display="flex" flexDirection="column"
                    sx={{
                        "& .MuiAutocomplete-popper": {
                            boxShadow: "none"
                        }
                    }}
                >
                    {
                        componentType !== "textbox" &&
                        <>
                            <MDBox p={1.5}>
                                <>
                                    {
                                        componentType !== "string" && (
                                            <TextField
                                                name="operator"
                                                select
                                                value={operatorVal}
                                                size="small"
                                                onChange={({ target: { value } }) => { setOperatorVal(value); setValuesVal(null); }}
                                                variant="outlined"
                                                sx={{ marginBottom: 1 }}
                                                fullWidth
                                            >
                                                {operators}
                                            </TextField>
                                        )
                                    }
                                </>
                                {
                                    !['set', 'notSet'].includes(operatorVal) &&
                                    <>
                                        {
                                            componentType === "string" && (
                                                <MDBox display="flex" flexDirection="column">
                                                    <MDTypography m={.5} my={1} variant="caption" fontWeight="medium">Contains</MDTypography>
                                                    <TextField
                                                        name="val"
                                                        value={value1 || ""}
                                                        size="small"
                                                        onChange={({ target: { value } }) => {
                                                            setValuesVal([value])
                                                        }}
                                                        variant="outlined"
                                                        fullWidth
                                                        error={errors?.value1}
                                                        disabled={!operatorVal}
                                                    ></TextField>
                                                </MDBox>
                                            )
                                        }
                                        {
                                            componentType === "integer" && (
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <TextField
                                                        name="val"
                                                        value={value1 || ""}
                                                        size="small"
                                                        onChange={({ target: { value } }) => {
                                                            if (isRangeOperatorVal)
                                                                setValuesVal([isNaN(parseInt(value)) ? value : parseInt(value), value2]);
                                                            else
                                                                setValuesVal([isNaN(parseInt(value)) ? value : parseInt(value)])
                                                        }}
                                                        variant="outlined"
                                                        fullWidth
                                                        error={errors?.value1}
                                                        disabled={!operatorVal}
                                                    ></TextField>
                                                    {
                                                        isRangeOperatorVal &&
                                                        <>
                                                            <b>-</b>
                                                            <TextField
                                                                name="val2"
                                                                value={value2 || ""}
                                                                size="small"
                                                                onChange={({ target: { value } }) => {
                                                                    setValuesVal([value1, isNaN(parseInt(value)) ? value : parseInt(value)]);
                                                                }}
                                                                variant="outlined"
                                                                fullWidth
                                                                error={errors?.value2}
                                                                disabled={!operatorVal}
                                                            ></TextField>
                                                        </>
                                                    }
                                                </Stack>
                                            )
                                        }
                                        {
                                            componentType === "float" && (
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <TextField
                                                        name="val"
                                                        value={value1 || ""}
                                                        size="small"
                                                        onChange={({ target: { value } }) => {
                                                            if (isRangeOperatorVal)
                                                                setValuesVal([value, value2]);
                                                            else
                                                                setValuesVal([value]);
                                                        }}
                                                        onBlur={({ target: { value } }) => {
                                                            if (isRangeOperatorVal)
                                                                setValuesVal([isNaN(parseFloat(value)) ? null : parseFloat(value), value2]);
                                                            else
                                                                setValuesVal(isNaN(parseFloat(value)) ? null : [parseFloat(value)])
                                                        }}
                                                        variant="outlined"
                                                        fullWidth
                                                        error={errors?.value1}
                                                        disabled={!operatorVal}
                                                    ></TextField>
                                                    {
                                                        isRangeOperatorVal &&
                                                        <>
                                                            <b>-</b>
                                                            <TextField
                                                                name="val2"
                                                                value={value2 || ""}
                                                                size="small"
                                                                onChange={({ target: { value } }) => {
                                                                    setValuesVal([value1, value]);
                                                                }}
                                                                onBlur={({ target: { value } }) => {
                                                                    setValuesVal([value1, isNaN(parseFloat(value)) ? null : parseFloat(value)]);
                                                                }}
                                                                variant="outlined"
                                                                fullWidth
                                                                error={errors?.value2}
                                                                disabled={!operatorVal}
                                                            ></TextField>
                                                        </>
                                                    }
                                                </Stack>
                                            )
                                        }
                                        {
                                            componentType === "date" && (
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <DesktopDatePicker
                                                        name={"val"}
                                                        inputFormat={defaultDateFormat || "DD/MM/YYYY"}
                                                        value={value1 ? moment(value1, "YYYY-MM-DD", true) : null}
                                                        onChange={(value) => {
                                                            if (isRangeOperatorVal)
                                                                setValuesVal([moment(value).format("YYYY-MM-DD"), value2]);
                                                            else
                                                                setValuesVal([moment(value).format("YYYY-MM-DD")]);
                                                        }}
                                                        renderInput={(params) =>
                                                            <TextField size="small"
                                                                fullWidth
                                                                {...params}
                                                                variant="outlined"
                                                                error={errors?.value1}
                                                                sx={{
                                                                    "& .MuiInputAdornment-root": {
                                                                        marginLeft: 0
                                                                    },
                                                                    "& input": {
                                                                        paddingRight: 0
                                                                    }
                                                                }}
                                                            />
                                                        }
                                                        disabled={!operatorVal}
                                                    />
                                                    {
                                                        isRangeOperatorVal &&
                                                        <>
                                                            <b>-</b>
                                                            <DesktopDatePicker
                                                                name={"val2"}
                                                                inputFormat={defaultDateFormat || "DD/MM/YYYY"}
                                                                value={value2 ? moment(value2, "YYYY-MM-DD", true) : null}
                                                                onChange={(value) => {
                                                                    setValuesVal([value1, moment(value).format("YYYY-MM-DD")]);
                                                                }}
                                                                renderInput={(params) => <TextField size="small"
                                                                    fullWidth
                                                                    {...params}
                                                                    variant="outlined"
                                                                    error={errors?.value2}
                                                                    sx={{
                                                                        "& .MuiInputAdornment-root": {
                                                                            marginLeft: 0
                                                                        },
                                                                        "& input": {
                                                                            paddingRight: 0
                                                                        }
                                                                    }}
                                                                />}
                                                                disabled={!operatorVal}
                                                            />
                                                        </>
                                                    }
                                                </Stack>
                                            )
                                        }
                                    </>
                                }

                            </MDBox>
                            <Stack direction="row-reverse" spacing={1}
                                sx={
                                    theme => ({
                                        p: 1.5,
                                        borderTop: `1px solid ${theme.palette.mode === 'light' ? '#eaecef' : '#30363d'}`
                                    })
                                }
                            >
                                <MDButton
                                    name='applyFilter'
                                    variant="text"
                                    color="info"
                                    sx={{
                                        textTransform: "none",
                                        px: 1,
                                        py: .5,
                                        borderRadius: 1
                                    }}
                                    onClick={handleSaveFilter}
                                // disabled={!filterValue?.val || filterValue?.val?.length === 0}
                                >
                                    Apply Filter
                                </MDButton>
                            </Stack>
                        </>
                    }
                    {
                        componentType === "textbox" &&
                        <>
                            <Autocomplete
                                key={`ac_${name}`}
                                open
                                multiple
                                onClose={(event, reason) => {
                                    if (reason === 'escape') {
                                        handleClose();
                                    }
                                }}
                                value={name === "Month" ? [filterValue?.values ? filterValue?.values[filterValue?.values?.length - 1] : ''] : filterValue?.values ? filterValue?.values : '' || []}
                                onChange={(event, newValue, reason) => {
                                    if (
                                        event.type === 'keydown' &&
                                        event.key === 'Backspace' &&
                                        reason === 'removeOption'
                                    ) {
                                        return;
                                    }

                                    if (dataType === "select") {
                                        handleFilterOnSelection([newValue[newValue.length - 1]]);
                                        handleClose();
                                    }
                                    else
                                        handleFilterOnSelection(newValue);
                                }}
                                filterOptions={handleFilterOptions}
                                disableCloseOnSelect
                                PopperComponent={PopperComponent}
                                renderTags={() => null}
                                loading={optionsLoading}
                                noOptionsText="No values"
                                renderOption={(props, option, { selected }) => {
                                    const { onClick, ...rest } = props;
                                    return (
                                        <li
                                            key={option}
                                            onClick={(selected && dataType === "select") || (selected && name === "Expense Type" && filterValue?.values.length === 1 ) ? () => { } : onClick}
                                            {...rest}
                                        >
                                            <Checkbox
                                                sx={{
                                                    p: 0,
                                                    mr: 1,
                                                    "& .MuiSvgIcon-root": {
                                                        height: 16,
                                                        width: 16,
                                                        border: "1px solid #c5c9cc",
                                                        borderRadius: dataType === "select" ? "8px" : "4px"
                                                    }
                                                }}
                                                checked={selected}
                                            />
                                            <MDBox
                                                sx={theme => ({
                                                    flexGrow: 1,
                                                    '& span': {
                                                        color:
                                                            theme.palette.mode === 'light' ? '#586069' : '#8b949e',
                                                    },
                                                })}
                                            >
                                                {option.label || option}
                                            </MDBox>
                                        </li>
                                    )
                                }}
                                options={options}
                                // getOptionLabel={(option) => option}
                                getOptionLabel={(option) => {
                                    return option?.label || option;
                                }}
                                renderInput={(params) => {
                                    // console.log("SearchFromChip=====>", searchVal, params)
                                    return <StyledPopperSearchbox
                                        ref={params.InputProps.ref}
                                        inputProps={{ ...params.inputProps, value: searchVal || "" }}
                                        autoFocus
                                        onChange={handleChange}
                                        placeholder="Search..."
                                    />
                                }
                                }
                            />
                            {
                                    name=="Expense Type" ? "" :
                                        dataType !== "select" &&
                                        <Stack direction="row-reverse" spacing={1}
                                            sx={
                                                theme => ({
                                                    p: 1.5,
                                                    borderTop: `1px solid ${theme.palette.mode === 'light' ? '#eaecef' : '#30363d'}`
                                                })
                                            }
                                        >
                                        <MDButton
                                        name='clearSelection'
                                        variant="text"
                                        color="info"
                                        sx={{
                                            textTransform: "none",
                                            marginRight: 'auto!important',
                                            px: 1,
                                            py: .5,
                                            borderRadius: 1
                                        }}
                                        onClick={handleClearFilter}
                                        disabled={!filterValue?.values || filterValue?.values?.length === 0}
                                        >
                                            Clear Selection
                                        </MDButton>
                                     </Stack>

                            }
                        </>
                    }

                </MDBox>
            </ClickAwayListener>
        </StyledPopper>
    </>
}

FilterChip.defaultProps = {
    valueLimit: 1,
    openOnMount: true,
    dismissible: true,
    defaultSelected: false,
    isCubeFilter: false,
    optionsLoading: false,
    sessionFilters: false
}

export default FilterChip;
