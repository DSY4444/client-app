import {
  Autocomplete,
  Card,
  Checkbox,
  Chip,
  createFilterOptions,
  Icon,
  IconButton,
  MenuItem,
  Modal,
  TextField,
  Tooltip,
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useAppController } from "context";
import useFetchRequest from "hooks/useFetchRequest";
import moment from "moment";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { parseJsonString } from "utils";
import _ from "lodash";

const filterTypes = {
  string: [
    "eq",
    "ne",
    "contains",
    "notContains",
    "startsWith",
    "endsWith",
    "notSet",
    "set",
  ],
  textbox: [
    "eq",
    "ne",
    "contains",
    "notContains",
    "startsWith",
    "endsWith",
    "notSet",
    "set",
  ],
  number: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "notBetween", "notSet", "set"],
  float: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "notBetween", "notSet", "set"],
  integer: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "notBetween", "notSet", "set"],
  currency: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "notBetween", "notSet", "set"],
  date: [
    "eq",
    "ne",
    "before",
    "after",
    "between",
    "notBetween",
    "notSet",
    "set"
  ],
  datepicker: [
    "eq",
    "ne",
    "before",
    "after",
    "between",
    "notBetween",
    "notSet",
    "set"
  ],
};

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

const componentTypeForFieldTypeAndOperator = {
  "string": "textbox",
  "string-eq": "selectList",
  "string-ne": "selectList",
  "textbox": "textbox",
  "textbox-eq": "selectList",
  "textbox-ne": "selectList",
  "float": "float",
  "currency": "float",
  "integer": "integer",
  "date": "date",
  "datepicker": "date",
};

const getOperatorOptions = (dataType) => {
  return filterTypes[dataType]?.map((f) => (
    <MenuItem key={f} value={f}>
      {filterTypeLabels[f]}
    </MenuItem>
  ));
};

const filter = createFilterOptions();

const SelectList = ({ conditionType, list, field, values, setValues, error: inputError, conditions }) => {
  const { response, error, loading, reloadData } = (conditionType === "Solutions") ? useFetchRequest(`/api/dataflow/offeringValues/${list}/${field}`, 'post', { filters: JSON.stringify(conditions)}) 
  : useFetchRequest(`/api/dataflow/listItemValues/${list}/${field}`) 

  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (response)
      setOptions(response.values || [])
  }, [response]);

  useEffect(() => {
    if (error)
      reloadData();
  }, [field]);

  if (error) {
    return <Tooltip placement="top" title="Error occured while fetching values"><Icon color="error">error</Icon></Tooltip>;
  }

  return <Autocomplete
    name={field}
    multiple
    limitTags={1}
    options={options}
    disableCloseOnSelect
    disableClearable
    loading={loading}
    value={values || []}
    onChange={(event, item) => {
      const valArr = item && item.length > 0 ? item.map(v => v.toString()) : item;
      setValues(valArr);
    }}
    fullWidth
    sx={{ marginRight: 1 }}
    filterOptions={(options, params) => {
      const filtered = filter(options, params);
      const { inputValue } = params;
      const isExisting = options.some((option) => inputValue === option);
      if (inputValue !== '' && !isExisting) {
        filtered.push(
          inputValue,
        );
      }

      return filtered;
    }}
    renderOption={(props, option, { selected }) => {
      const isExisting = options.some((o) => o === option);
      return (<li {...props}>
        <Checkbox
          sx={{
            p: 0,
            mr: 1,
            "& .MuiSvgIcon-root": {
              height: 16,
              width: 16,
              border: "1px solid #c5c9cc",
              borderRadius: "4px"
            }
          }}
          checked={selected}
        />
        {(isExisting || selected) ? option : `Add "${option}"`}
      </li>
      )
    }}
    renderInput={(params) => (
      <TextField {...params} error={inputError} label="Value" fullWidth size="small" sx={{ margin: 0.5 }} />
    )}
  />
};

const isRangeOperator = (operatorVal) => ["between", "notBetween"].includes(operatorVal);

const Condition = (props) => {
  const {
    conditionType,
    yearFilter,
    monthFilter,
    fromAsset,
    tableCols,
    selectedFields,
    k,
    type,
    field,
    operator,
    value,
    onConditionChange,
    onConditionDelete,
    errors,
    conditions
  } = props;

  const [controller,] = useAppController();
  const { appDef: { settings } } = controller;
  const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

  const [operators, setOperators] = useState([]);
  const [fieldVal, setFieldVal] = useState(field);
  const [fieldTypeVal, setFieldTypeVal] = useState(type);
  const [operatorVal, setOperatorVal] = useState(operator);
  const [valuesVal, setValuesVal] = useState(value);
  const columns = tableCols?.filter(item => item.schemaName === field || !selectedFields?.includes(item.schemaName))?.map(item => (
    <MenuItem key={item.name} value={item.schemaName}>
      {item.displayName}
    </MenuItem>
  ));

  useEffect(() => {
    setFieldVal(field)
    setFieldTypeVal(type)
    setOperatorVal(operator)
    setValuesVal(value)
    if (field) {
      const selectedCol = tableCols?.find((c) => c.schemaName === field);
      if (selectedCol) {
        setFieldTypeVal(selectedCol.type);
        setOperators(getOperatorOptions(selectedCol.type));
      }
    }
  }, [tableCols, field, type, operator, value]);
  useEffect(() => {
    if (onConditionChange)
      onConditionChange({ k, type: fieldTypeVal, field: fieldVal, operator: operatorVal, value: valuesVal })
  }, [fieldTypeVal, fieldVal, operatorVal, valuesVal]);

  let componentType = fieldTypeVal ? (componentTypeForFieldTypeAndOperator[`${fieldTypeVal}-${operatorVal || ""}`] || componentTypeForFieldTypeAndOperator[fieldTypeVal]) : "textbox";
  if (['set', 'notSet'].includes(operatorVal)) {
    // hide value for these operators
    componentType = "hidden";
  }
  const isRangeOperatorVal = isRangeOperator(operatorVal);
  const valuesArr = Array.isArray(valuesVal) && valuesVal?.length === 2 ? valuesVal : [null, null];
  const value1 = isRangeOperatorVal ? valuesArr[0] : valuesVal;
  const value2 = isRangeOperatorVal ? valuesArr[1] : valuesVal;

  return (
    <MDBox display="flex" justifyContent="flex-start" alignItems="center">
      <TextField
        name="field"
        label="Field"
        select
        value={fieldVal}
        size="small"
        onChange={({ target: { value } }) => { setFieldVal(value); setOperatorVal("eq"); setValuesVal(null); }}
        variant="outlined"
        sx={{ margin: 0.5, minWidth: 150, maxWidth: 150 }}
        error={errors?.field}
      >
        {columns}
      </TextField>
      <TextField
        name="operator"
        label="Operator"
        select
        InputLabelProps={{ shrink: operatorVal }}
        value={operatorVal}
        size="small"
        onChange={({ target: { value } }) => { setOperatorVal(value); setValuesVal(valuesVal ? valuesVal : null); }}
        variant="outlined"
        sx={{ margin: 0.5, minWidth: 150, maxWidth: 150 }}
        error={errors?.operator}
        disabled={!fieldVal}
      >
        {operators}
      </TextField>
      {
        componentType === "selectList" && (
          <SelectList
            conditionType={conditionType}
            yearFilter={yearFilter}
            monthFilter={monthFilter}
            list={fromAsset}
            field={fieldVal}
            values={valuesVal}
            setValues={setValuesVal}
            error={errors?.value1}
            conditions={conditions}
          />
        )
      }
      {
        componentType === "textbox" && (
          <TextField
            name="val"
            label="Value"
            value={valuesVal || ""}
            size="small"
            onChange={({ target: { value } }) => setValuesVal(value)}
            variant="outlined"
            sx={{ margin: 0.5, minWidth: 150, maxWidth: 150 }}
            error={errors?.value1}
            disabled={!operatorVal}
          ></TextField>
        )
      }
      {
        componentType === "integer" && (
          <>
            <TextField
              name="val"
              label="Value"
              value={value1 || ""}
              size="small"
              onChange={({ target: { value } }) => {
                if (isRangeOperatorVal)
                  setValuesVal([isNaN(parseInt(value)) ? value : parseInt(value), value2]);
                else
                  setValuesVal(isNaN(parseInt(value)) ? value : parseInt(value))
              }}
              variant="outlined"
              sx={{ margin: 0.5, minWidth: 150, maxWidth: 150 }}
              error={errors?.value1}
              disabled={!operatorVal}
            ></TextField>
            {
              isRangeOperatorVal &&
              <TextField
                name="val2"
                label="Value"
                value={value2 || ""}
                size="small"
                onChange={({ target: { value } }) => {
                  if (isRangeOperatorVal)
                    setValuesVal(value1, [isNaN(parseInt(value)) ? value : parseInt(value)]);
                  else
                    setValuesVal(isNaN(parseInt(value)) ? value : parseInt(value))
                }}
                variant="outlined"
                sx={{ margin: 0.5, minWidth: 150, maxWidth: 150 }}
                error={errors?.value2}
                disabled={!operatorVal}
              ></TextField>
            }
          </>
        )
      }
      {
        componentType === "float" && (
          <>
            <TextField
              name="val"
              label={isRangeOperatorVal ? "From" : "Value"}
              value={value1 || ""}
              size="small"
              onChange={({ target: { value } }) => {
                if (isRangeOperatorVal)
                  setValuesVal([value, value2]);
                else
                  setValuesVal(value);
              }}
              onBlur={({ target: { value } }) => {
                if (isRangeOperatorVal)
                  setValuesVal([isNaN(parseFloat(value)) ? null : parseFloat(value), value2]);
                else
                  setValuesVal(isNaN(parseFloat(value)) ? null : parseFloat(value))
              }}
              variant="outlined"
              sx={{ margin: 0.5, minWidth: 150, maxWidth: 150 }}
              error={errors?.value1}
              disabled={!operatorVal}
            ></TextField>
            {
              isRangeOperatorVal &&
              <TextField
                name="val2"
                label="To"
                value={value2 || ""}
                size="small"
                onChange={({ target: { value } }) => {
                  if (isRangeOperatorVal)
                    setValuesVal([value1, value]);
                  else
                    setValuesVal(value);
                }}
                onBlur={({ target: { value } }) => {
                  if (isRangeOperatorVal)
                    setValuesVal([value1, isNaN(parseFloat(value)) ? null : parseFloat(value)]);
                  else
                    setValuesVal(isNaN(parseFloat(value)) ? null : parseFloat(value))
                }}
                variant="outlined"
                sx={{ margin: 0.5, minWidth: 150, maxWidth: 150 }}
                error={errors?.value2}
                disabled={!operatorVal}
              ></TextField>
            }
          </>
        )
      }
      {
        componentType === "date" && (
          <>
            <DesktopDatePicker
              name={"val"}
              inputFormat={defaultDateFormat || "DD/MM/YYYY"}
              value={value1 ? moment(value1, "YYYY-MM-DD", true) : null}
              onChange={(value) => {
                if (isRangeOperatorVal)
                  setValuesVal([moment(value).format("YYYY-MM-DD"), value2]);
                else
                  setValuesVal(moment(value).format("YYYY-MM-DD"));
              }}
              renderInput={(params) =>
                <TextField size="small" sx={{ margin: 0.5, width: 150 }} {...params} variant="outlined" error={errors?.value1}
                  label={isRangeOperatorVal ? "From" : "Value"}
                />
              }
              disabled={!operatorVal}
            />
            {
              isRangeOperatorVal &&
              <DesktopDatePicker
                name={"val2"}
                inputFormat={defaultDateFormat || "DD/MM/YYYY"}
                value={value2 ? moment(value2, "YYYY-MM-DD", true) : null}
                onChange={(value) => {
                  if (isRangeOperatorVal)
                    setValuesVal([value1, moment(value).format("YYYY-MM-DD")]);
                  else
                    setValuesVal(moment(value).format("YYYY-MM-DD"));
                }}
                renderInput={(params) => <TextField size="small" sx={{ margin: 0.5, width: 150 }} {...params} label="To" variant="outlined" error={errors?.value2} />}
                disabled={!operatorVal}
              />
            }
          </>
        )
      }
      <IconButton mr={0.5} onClick={() => onConditionDelete(k)} size="small">
        <Icon color="error">delete</Icon>
      </IconButton>
    </MDBox>
  );
};

const DEFAULT_CONDITION_ARR = [
  {
    k: 1,
    field: null,
    operator: null,
    value: null,
  },
];

const RuleBuilder = (props) => {
  const { conditionType, fromAsset, tableCols, conditionJson, onConditionClose, onChange, onClear, onConditionSave } = props;
  let conditionsArr = parseJsonString(conditionJson) || DEFAULT_CONDITION_ARR;
  const [errors, setErrors] = useState({});
  const [conditions, setConditions] = useImmer(conditionsArr);
  const selectedFields = conditions?.map(c => c.field);

  const handleConditionChange = (conditionValue) => {
    if (conditionValue)
      setConditions(draft => {
        let updatedCondition = draft.find(c => c.k === conditionValue.k);
        if (updatedCondition) {
          updatedCondition.type = conditionValue.type;
          updatedCondition.field = conditionValue.field;
          updatedCondition.operator = conditionValue.operator;
          updatedCondition.value = conditionValue.value;
        }
      })
  };
  
  if (onClear) {
    onChange(null)
  }

  const handleNewConditionClick = () => {
    setConditions((prevConditions) => {
      const conditionKey =
        prevConditions?.length === 0
          ? 1
          : prevConditions[prevConditions.length - 1].k + 1;
      return [
        ...prevConditions,
        { k: conditionKey, field: null, operator: null, value: null },
      ];
    });
  };

  const handleConditionClose = () => {
    if (onConditionClose) onConditionClose();
  };

  const handleConditionDelete = (k) => {
    setConditions(draft => {
      return draft.filter(c => c.k !== k);
    })
  };

  const validateDataType = (type, value, isRangeOperatorVal) => {
    switch (type) {
      case "string":
        return !value || typeof value === 'string' ? (value || "").trim() === "" : value?.length === 0;
      case "textbox":
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
      case "date": {
        if (isRangeOperatorVal) {
          if (!value || !Array.isArray(value) || value?.length !== 2)
            return [true, true];
          return [!moment(value[0], "YYYY-MM-DD", true).isValid(), !moment(value[1], "YYYY-MM-DD", true).isValid()];
        }
        return !value || !moment(value, "YYYY-MM-DD", true).isValid();
      }
      case "datepicker": {
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

  const handleConditionSave = () => {
    let errorsObj = {};
    conditions?.forEach(c => {
      const isRangeOperatorVal = isRangeOperator(c.operator);
      const validDataType = ['set', 'notSet'].includes(c.operator) ? false : validateDataType(c.type, c.value, isRangeOperatorVal);
      if (!c.field || !c.operator || (!isRangeOperatorVal && validDataType) || (Array.isArray(validDataType) && validDataType.includes(true))) {
        errorsObj[c.k] = {
          k: c.k,
          field: !c.field,
          operator: !c.operator,
          value1: isRangeOperatorVal ? validDataType[0] : validDataType,
          value2: isRangeOperatorVal ? validDataType[1] : validDataType,
        };
      }
    });

    if (Object.keys(errorsObj).length === 0) {
      if (onConditionSave) {
        onConditionSave(JSON.stringify(conditions));
        onChange(JSON.stringify(conditions))
      }
    }
    console.error(errorsObj)
    setErrors(errorsObj);
  };

  return (
    <Modal open={true} onClose={handleConditionClose}>
      <MDBox
        p={3}
        height="100%"
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Card sx={{ minWidth: "700px", overflow: "hidden" }}>
          <MDBox
            px={3}
            pt={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <MDBox>
              <MDTypography variant="h6" component="span">
                Conditions for {`${_.startCase(fromAsset)}`}
              </MDTypography>
            </MDBox>
            <MDBox display="flex">
              <IconButton onClick={handleConditionClose} title="Close">
                <Icon>close</Icon>
              </IconButton>
            </MDBox>
          </MDBox>
          {fromAsset && (
            <MDBox
              sx={{
                p: 2,
                display: "flex",
                mx: 3,
                my: 1,
                borderRadius: 2,
                border: "2px dashed #ddd",
              }}
            >
              {conditions && conditions.length > 0 && (
                <MDBox
                  sx={{
                    width: 50,
                    pt: 0.5,
                    pb: 2.25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MDBox
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 25,
                      height: "100%",
                      border: "2px solid #1A73E8",
                      borderRight: "none",
                      borderTopLeftRadius: 6,
                      borderBottomLeftRadius: 6,
                    }}
                  >
                    <Chip
                      label="AND"
                      size="small"
                      sx={{
                        background: "#d9eaef",
                        position: "absolute",
                        left: -18,
                      }}
                    />
                  </MDBox>
                </MDBox>
              )}
              <MDBox flex={1}>
                {conditions?.map((c, i) => (
                  <Condition conditionType={conditionType} key={`c${i}`} errors={errors[c.k]} fromAsset={fromAsset} tableCols={tableCols} selectedFields={selectedFields} {...c} onConditionChange={handleConditionChange} onConditionDelete={handleConditionDelete} conditions={conditions}/>
                ))}

                <MDButton
                  size="large"
                  startIcon={<Icon fontSize="medium">add</Icon>}
                  sx={{ mt: 1, ml: 1 }}
                  variant="text"
                  color="info"
                  onClick={handleNewConditionClick}
                >
                  Add Condition
                </MDButton>
              </MDBox>
            </MDBox>
          )}
          <MDBox p={3} textAlign="right">
            <MDButton
              name="save"
              variant="gradient"
              color="info"
              onClick={handleConditionSave}
            >
              Save
            </MDButton>
          </MDBox>
        </Card>
      </MDBox>
    </Modal>
  );
};

export default RuleBuilder;