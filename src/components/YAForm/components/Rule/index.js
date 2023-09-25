import _ from "lodash";
import { Chip, Icon, Tooltip } from "@mui/material";
// import { Alert, Chip, CircularProgress, Icon, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
// import MDTypography from "components/MDTypography";
import moment from "moment";
import { useEffect, useState } from "react";
import { parseJsonString } from "utils";
import fetchRequest from "utils/fetchRequest";
import RuleBuilder from "./RuleBuilder";
import { Controller } from "react-hook-form";
import MDTypography from "components/MDTypography";

const filterTypeLabels = {
    eq: "is equal to",
    equals: "is equal to",
    ne: "is not equal to",
    notEquals: "is not equal to",
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

const getFilterDescription = (field, dataType = "string", operator, values,tableCols) => {
    let valueDescription = "";
    let fld = _.find(tableCols, { "schemaName": field})
    if (Array.isArray(values) && values?.length > 1) {
        if (["between", "notBetween"].includes(operator)) {
            if (dataType === "date")
                valueDescription = `${moment(values[0]).format(
                    "MMM DD YYYY"
                )} and ${moment(values[1]).format("MMM DD YYYY")}`;
            else
                valueDescription = `${values[0]} and ${values[1]}`;
        }
        else
            valueDescription = values.slice(0, values.length - 1).join(", ") + " or " + values[values.length - 1];
    }
    else if (Array.isArray(values) && values?.length === 1) {
        if (dataType === "date")
            valueDescription = moment(values).format("MMM DD YYYY");
        else valueDescription = values[0];
    }
    else if (["set", "notSet"].includes(operator)) { valueDescription = ""; }
    else { valueDescription = values; }
    return `${_.startCase(fld?.displayName)} ${filterTypeLabels[operator]} ${valueDescription}`;
};

const Rule = (props) => {
    const { control, fieldDef: { name, required }, fromAsset, condition, fromAssetChange, setOnClear, onClear, onConditionChange, errorMessage } = props;
        // const {
        //     watch, setFromAsset, setValue, control, disabled, formId, fieldDef: { name, displayName, required, variant, width, placeholder, dataSource, toolTip }, errorMessage, 
        //     errors, fromAsset, splitStrategy, weightColumn, tierAllocation, condition, onFromAssetChange, onSplitStrategyChange, onWeightColumnChange, onTierAllocationChange, 
        //     fromAssetChange, setOnClear, onClear, onConditionChange, onClearAssetSelection, showListField, setErrors } = props;
    const [showCondition, setShowCondition] = useState(false);
    // const [fetchingCount, setFetchingCount] = useState(false);
    // const [fetchingCountError, setFetchingCountError] = useState(false);
    // const [listItemsCount, setListItemsCount] = useState(null);
    const [tableCols, setTableCols] = useState([]);
    const conditionsArr = parseJsonString(condition) || [];
    const conditions = conditionsArr?.map((c) => <Tooltip key={conditionsArr.indexOf(c)} title={getFilterDescription(c.field, c.type, c.operator, c.value,tableCols)} ><Chip size="small" key={c.field} sx={{ margin: 0.3 }} label={getFilterDescription(c.field, c.type, c.operator, c.value,tableCols)} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" /></Tooltip>);

    // const fromAssetName = fromAsset ? _.startCase(fromAsset).toLowerCase() : ""

    useEffect(async () => {
        // setShowListField(fromAsset && fromAsset !== "");
        if (fromAsset && fromAsset !== "") {
            let [_err, data] = await fetchRequest.get(`/api/dataflow/resource/${fromAsset}`)
            if (_err)
                console.error(_err)
            setTableCols(data.fields)
            // fetchAssetCount(fromAsset)
        }

    }, [fromAsset])

    const handleCondition = () => {
        setShowCondition(true);
        // setErrors({ fromAsset: true })
    }

    const handleConditionClose = () => {
        setShowCondition(false)
    }

    const hanldeConditionSave = (_condition) => {
        onConditionChange(_condition)
        setShowCondition(false)
    }

    // const fetchAssetCount = async (assetName) => {
    //     setFetchingCount(true);
    //     setFetchingCountError(false);
    //     let [_err1, data1] = await fetchRequest.post(
    //         `/api/dataflow/offeringCount/${assetName}`, { filters: JSON.stringify(conditionsArr) }
    //     );
    //     setListItemsCount(data1?.count);
    //     if (_err1) {
    //         console.error(_err1);
    //         setFetchingCountError(true);
    //     }
    //     setFetchingCount(false);
    // }

    // useEffect(() => {
    //     if (fromAsset)
    //         fetchAssetCount(fromAsset)
    // }, [condition])

    // const handleTier = (value, i) => {
    //     let tr = [...tierAllocation];
    //     tr[i] = isNaN(parseInt(value)) ? 0 : parseInt(value);
    //     onTierAllocationChange(tr);
    // }

    // const totalAllocatedPercentage = _.sum(tierAllocation);

    const renderListConfig = () => {
        return (
            <>
                <MDBox display="flex" flexDirection="row" alignItems="flex-start" justifyContent="center">
                    <MDBox display="flex" flexDirection="column"
                        mt={fromAsset && fromAsset !== "" ? 2 : 1}
                        textAlign={fromAsset && fromAsset !== "" ? "left" : "center"}
                    >
                        {/* <MDTypography
                            variant={fromAsset && fromAsset !== "" ? "caption" : "subtitle2"}
                            fontWeight="medium">{fromAsset && fromAsset !== "" ? "Distributing to Solution Offering" : "Choose an Offering"}
                        </MDTypography>
                        <TextField sx={{
                            minWidth: fromAsset && fromAsset !== "" ? 160 : 300,
                        }} name="fromAsset" select margin="dense" size="small" variant="outlined"
                            onChange={async (e) => {
                                onFromAssetChange(e.target.value)
                                setErrors({})
                                let [_err, data] = await fetchRequest.get(`/api/dataflow/resource/${e.target.value}`)
                                if (_err)
                                    console.error(_err)
                                onConditionChange("")
                                setTableCols(data.fields)
                                fetchAssetCount(e.target.value)
                            }}
                            value={fromAsset}
                        >
                            <MenuItem key="1" value="solutionOffering">Solution Offering</MenuItem>
                        </TextField>
                        {errors && errors.fromAsset && <MDTypography mt={1} variant="caption" color="error">Offering is required.</MDTypography>} */}
                        {(!conditions || conditions.length === 0) &&
                            <MDButton ml={2} disabled={!fromAsset} startIcon={<Icon>add</Icon>} variant="text" color="info" onClick={(e) => handleCondition(e)}>Add Rule</MDButton>
                        }
                    </MDBox>
                    {
                        // fromAsset && fromAsset !== "" && (
                        //     <MDBox mt={2} ml={1.2} display="flex" flexDirection="column" textAlign="left">
                        //         <MDTypography variant="caption" fontWeight="medium" color={errors?.fromAsset ? "error" : "dark"}>Splitting</MDTypography>
                        //         <TextField sx={{ minWidth: 120 }} name="splitStrategy" select margin="dense" size="small" variant="outlined"
                        //             onChange={async (e) => {
                        //                 onSplitStrategyChange(e.target.value)
                        //                 setErrors({})
                        //             }}
                        //             value={splitStrategy || "equally"}
                        //         >
                        //             <MenuItem key="1" value="equally">Equally</MenuItem>
                        //             <MenuItem key="2" value="byWeight">By Weight</MenuItem>
                        //             {/* <MenuItem key="3" value="byTier">By Tier</MenuItem> */}
                        //         </TextField>
                        //         {errors && errors.splitStrategy &&  <MDTypography mt={1} variant="caption" color="error">Splitting required.</MDTypography>}
                        //     </MDBox>
                        // )
                    }
                    {
                        // splitStrategy && splitStrategy === "byWeight" &&
                        // <MDBox mt={2} ml={1.2} display="flex" flexDirection="column" textAlign="left">
                        //     <MDTypography variant="caption" fontWeight="medium" color={errors?.fromAsset ? "error" : "dark"}>Weight Column *</MDTypography>
                        //     <TextField sx={{ minWidth: 120 }} name="weightColumn" select margin="dense" size="small" variant="outlined" onChange={async (e) => {
                        //         onWeightColumnChange(e.target.value)
                        //     }}
                        //         value={weightColumn}
                        //         error={errors?.weightColumn}
                        //     // helperText={errors?.weightColumn && "Required"}
                        //     >
                        //         {
                        //             tableCols?.filter(item => item.weight)?.map((item) =>
                        //                 <MenuItem key={item.name} value={item.name}>
                        //                     {item.displayName}
                        //                 </MenuItem>
                        //             )
                        //         }
                        //     </TextField>
                        // </MDBox>
                    }
                    {
                        // fromAsset && fromAsset !== "" &&
                        // <IconButton size="small" sx={{ marginTop: 5.5 }} onClick={onClearAssetSelection} title="Click to clear asset distribution"><Icon color="text">cancel</Icon></IconButton>
                    }
                </MDBox>
                {
                    fromAsset && fromAsset !== "" && (
                        <>
                            {conditions && conditions.length > 0 && (
                                <MDBox sx={{
                                    py: 1,
                                    px: 2,
                                    m: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    flexWrap: "wrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    borderRadius: 2,
                                    border: "2px dashed #ddd",
                                    width: "500px",
                                }}
                                >
                                    {
                                        conditions
                                    }
                                </MDBox>
                            )}
                            {conditions && conditions.length > 0 &&
                                <MDBox>
                                    <MDButton ml={2} mb={2} startIcon={<Icon>edit</Icon>} variant="text" color="text" onClick={(e) => handleCondition(e)}>Edit Rule</MDButton>
                                    <MDButton ml={2} mb={2} startIcon={<Icon>cancel</Icon>} variant="text" color="text" onClick={() => {onConditionChange(null); setOnClear(true); handleCondition()}}>Clear</MDButton>
                                </MDBox>
                            }
                            {
                                // splitStrategy && splitStrategy === "byTier" && (
                                //     <>
                                //         <MDTypography sx={{ marginTop: 2, marginBottom: 2 }} variant="caption" fontWeight="medium">Allocate Portion Percentages to Tiers *</MDTypography>
                                //         <table cellPadding={0} cellSpacing={0}>
                                //             <tbody>
                                //                 <tr>
                                //                     {tierAllocation.map((trItem, i) => {
                                //                         return (
                                //                             <td key={`td${i}`}>
                                //                                 <MDBox display="flex" flexDirection="column" alignItems="center">
                                //                                     <MDTypography variant="caption" fontWeight="medium" color="text">{`Tier ${i + 1}`}</MDTypography>
                                //                                     <TextField placeholder="0"
                                //                                         InputProps={{
                                //                                             endAdornment: <InputAdornment disableTypography sx={{ fontSize: 13 }} position="end">%</InputAdornment>,
                                //                                         }}
                                //                                         sx={{ width: 72, mx: 0.2, "& .MuiInputBase-input": { textAlign: "center", paddingRight: 0 } }} id="trPortion" name="trPortion" value={trItem[i]}
                                //                                         onChange={(e) => {
                                //                                             handleTier(e.target.value, i)
                                //                                         }}
                                //                                         margin="dense" variant="outlined" >
                                //                                     </TextField>
                                //                                 </MDBox>
                                //                             </td>

                                //                         )
                                //                     })}
                                //                 </tr>
                                //             </tbody>
                                //         </table>
                                //         {errors.tierAllocation && <MDTypography sx={{ marginTop: 1 }} variant="caption" color="error">Tier allocation portion should be between 0 and 100. Total for all tiers should be 100% </MDTypography>}
                                //         <MDTypography sx={{ marginTop: 1, marginBottom: 1 }} variant="button" fontWeight="medium" color={"dark"}>Total:&nbsp;{isNaN(totalAllocatedPercentage) ? 0 : totalAllocatedPercentage}%</MDTypography>
                                //     </>
                                // )
                            }
                            {
                            // fetchingCount && (<CircularProgress size={30} sx={{ marginTop: 1 }} color="info" />)
                            }
                            {
                            // !fetchingCount &&
                            //     <MDBox display="flex">
                            //         {
                            //             fetchingCountError && (
                            //                 <Alert severity="error"
                            //                     sx={{ marginTop: 1, marginBottom: 1, fontSize: "14px", textAlign: "left" }}
                            //                 >{'Error occured while fetching asset count'}</Alert>
                            //             )
                            //         }
                            //         {
                            //             !fetchingCountError && (
                            //                 <Alert severity={(listItemsCount || 0) === 0 ? "warning" : "info"}
                            //                     sx={{ marginTop: 1, fontSize: "14px", textAlign: "left" }}
                            //                 >
                            //                     Distributing to <strong>{`${listItemsCount || 0}`}</strong>{` ${_.startCase(fromAssetName)}(s)`}
                            //                 </Alert>
                            //             )
                            //         }
                            //         <IconButton size="small" sx={{ marginTop: 1 }} onClick={() => fetchAssetCount(fromAsset)} title={`Click to refetch ${_.startCase(fromAssetName)} count`}><Icon color="text">refresh</Icon></IconButton>
                            //     </MDBox>
                            }
                        </>
                    )
                }
            </>
        );
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) =>
            <>
            {!onClear && !fromAssetChange && onConditionChange(value)}
            <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{border: required && errorMessage ? '1px solid red' : '', pb: '7px' }}>
            {showCondition && <RuleBuilder onChange={onChange} value={value} conditionType={"Rule"} conditionJson={condition} fromAsset={fromAsset} tableCols={tableCols} onConditionClose={handleConditionClose} onConditionSave={hanldeConditionSave} onClear={onClear}/>}
            {/* {
                !showListField && (
                    <MDButton
                        size="small"
                        sx={{ mt: 1, ml: 1, textTransform: "none" }}
                        variant="outlined"
                        color="info"
                        onClick={() => setShowListField(true)}>Distribute to Offering?</MDButton>
                )
            } */}
            {
                // showListField && renderListConfig()
                renderListConfig()
            }
            </MDBox>
            {errorMessage && <MDTypography variant="caption" fontWeight="medium" color={errorMessage ? "error" : "dark"}>{errorMessage}</MDTypography>}
            </>}
        />
    );
}

export default Rule;