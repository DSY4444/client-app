import _ from "lodash";
import { Alert, Chip, CircularProgress, Icon, IconButton, InputAdornment, MenuItem, TextField } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import moment from "moment";
import { useEffect, useState } from "react";
import { parseJsonString } from "utils";
import fetchRequest from "utils/fetchRequest";
import ConditionBuilder from "components/ConditionBuilder";

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

const getFilterDescription = (field, dataType = "string", operator, values) => {
    let valueDescription = "";
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
    return `${_.startCase(field)} ${filterTypeLabels[operator]} ${valueDescription}`;
};

const ListRule = (props) => {
    const { errors, solutionSingle, yearFilter, monthFilter, destinationTable, splitStrategy, weightColumn, tierAllocation, condition, onDestinationTableChange, onSplitStrategyChange, onWeightColumnChange, onTierAllocationChange, onConditionChange, onClearAssetSelection } = props;
    const [showCondition, setShowCondition] = useState(false);
    const [showListField, setShowListField] = useState(false);
    const [fetchingCount, setFetchingCount] = useState(false);
    const [fetchingCountError, setFetchingCountError] = useState(false);
    const [listItemsCount, setListItemsCount] = useState(null);
    const [tableCols, setTableCols] = useState([]);
    const conditionsArr = parseJsonString(condition) || [];
    const conditions = conditionsArr?.map((c) => <Chip size="small" key={c.field} sx={{ margin: 0.3 }} label={getFilterDescription(c.field, c.type, c.operator, c.value)} />);

    const destinationTableName = destinationTable ? _.startCase(destinationTable).toLowerCase() : ""

    useEffect(() => {
        setShowListField(destinationTable && destinationTable !== "");
    }, [destinationTable, solutionSingle])

    const handleCondition = () => {
        if (destinationTable === "") {
            // setErrors({ destinationTable: true })
        } else {
            setShowCondition(true);
        }
    }

    const handleConditionClose = () => {
        setShowCondition(false)
    }

    const hanldeConditionSave = (_condition) => {
        onConditionChange(_condition)
        setShowCondition(false)
    }

    const fetchAssetCount = async (assetName) => {
        setFetchingCount(true);
        setFetchingCountError(false);
        let [_err1, data1] = await fetchRequest.post(
            `/api/dataflow/offeringCount/${assetName}/${solutionSingle.split(" | ")[2]}`, { filters: JSON.stringify(conditionsArr) }
        );
        setListItemsCount(data1?.count);
        if (_err1) {
            console.error(_err1);
            setFetchingCountError(true);
        }
        setFetchingCount(false);
    }

    useEffect(() => {
        if (destinationTable)
            fetchAssetCount(destinationTable)
    }, [condition, solutionSingle])

    const handleTier = (value, i) => {
        let tr = [...tierAllocation];
        tr[i] = isNaN(parseInt(value)) ? 0 : parseInt(value);
        onTierAllocationChange(tr);
    }

    const totalAllocatedPercentage = _.sum(tierAllocation);

    const renderListConfig = () => {
        return (
            <>
                <MDBox display="flex" flexDirection="row" alignItems="flex-start" justifyContent="center">
                    <MDBox display="flex" flexDirection="column"
                        mt={destinationTable && destinationTable !== "" ? 2 : 1}
                        textAlign={destinationTable && destinationTable !== "" ? "left" : "center"}
                    >
                        <MDTypography
                            variant={destinationTable && destinationTable !== "" ? "caption" : "subtitle2"}
                            fontWeight="medium">{destinationTable && destinationTable !== "" ? "Distributing to Solution Offering" : "Choose an Offering"}
                        </MDTypography>
                        <TextField sx={{
                            minWidth: destinationTable && destinationTable !== "" ? 160 : 300,
                        }} name="DestinationTable" select margin="dense" size="small" variant="outlined"
                            onChange={async (e) => {
                                onDestinationTableChange(e.target.value)
                                let [_err, data] = await fetchRequest.get(`/api/dataflow/resource/${e.target.value}`)
                                if (_err)
                                    console.error(_err)
                                onConditionChange("")
                                setTableCols(data.fields)
                                fetchAssetCount(e.target.value)
                            }}
                            value={destinationTable}
                        >
                            <MenuItem key="1" value="solutionOffering">Solution Offering</MenuItem>
                        </TextField>
                        {destinationTable && destinationTable !== "" && (!conditions || conditions.length === 0) &&
                            <MDButton ml={2} startIcon={<Icon>add</Icon>} variant="text" color="info" onClick={(e) => handleCondition(e)}>Add Conditions</MDButton>
                        }
                    </MDBox>
                    {
                        destinationTable && destinationTable !== "" && (
                            <MDBox mt={2} ml={1.2} display="flex" flexDirection="column" textAlign="left">
                                <MDTypography variant="caption" fontWeight="medium" color={errors?.destinationTable ? "error" : "dark"}>Splitting</MDTypography>
                                <TextField sx={{ minWidth: 120 }} name="splitStrategy" select margin="dense" size="small" variant="outlined"
                                    onChange={async (e) => {
                                        onSplitStrategyChange(e.target.value)
                                    }}
                                    value={splitStrategy || "equally"}
                                >
                                    <MenuItem key="1" value="equally">Equally</MenuItem>
                                    <MenuItem key="2" value="byWeight">By Weight</MenuItem>
                                    <MenuItem key="3" value="byTier">By Tier</MenuItem>
                                </TextField>
                            </MDBox>
                        )
                    }
                    {
                        splitStrategy && splitStrategy === "byWeight" &&
                        <MDBox mt={2} ml={1.2} display="flex" flexDirection="column" textAlign="left">
                            <MDTypography variant="caption" fontWeight="medium" color={errors?.destinationTable ? "error" : "dark"}>Weight Column *</MDTypography>
                            <TextField sx={{ minWidth: 120 }} name="weightColumn" select margin="dense" size="small" variant="outlined" onChange={async (e) => {
                                onWeightColumnChange(e.target.value)
                            }}
                                value={weightColumn}
                                error={errors?.weightColumn}
                            // helperText={errors?.weightColumn && "Required"}
                            >
                                {
                                    tableCols?.filter(item => item.weight)?.map((item) =>
                                        <MenuItem key={item.name} value={item.name}>
                                            {item.displayName}
                                        </MenuItem>
                                    )
                                }
                            </TextField>
                        </MDBox>
                    }
                    {
                        destinationTable && destinationTable !== "" &&
                        <IconButton size="small" sx={{ marginTop: 5.5 }} onClick={onClearAssetSelection} title="Click to clear asset distribution"><Icon color="text">cancel</Icon></IconButton>
                    }
                </MDBox>
                {
                    destinationTable && destinationTable !== "" && (
                        <>
                            {conditions && conditions.length > 0 && (
                                <MDBox sx={{
                                    py: 1,
                                    px: 2,
                                    m: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexWrap: "wrap",
                                    borderRadius: 2,
                                    border: "2px dashed #ddd",
                                }}
                                >
                                    {
                                        conditions
                                    }
                                </MDBox>
                            )}
                            {conditions && conditions.length > 0 &&
                                <MDBox>
                                    <MDButton ml={2} mb={2} startIcon={<Icon>edit</Icon>} variant="text" color="text" onClick={(e) => handleCondition(e)}>Edit Conditions</MDButton>
                                    <MDButton ml={2} mb={2} startIcon={<Icon>cancel</Icon>} variant="text" color="text" onClick={() => onConditionChange("")}>Clear</MDButton>
                                </MDBox>
                            }
                            {
                                splitStrategy && splitStrategy === "byTier" && (
                                    <>
                                        <MDTypography sx={{ marginTop: 2, marginBottom: 2 }} variant="caption" fontWeight="medium">Allocate Portion Percentages to Tiers *</MDTypography>
                                        <table cellPadding={0} cellSpacing={0}>
                                            <tbody>
                                                <tr>
                                                    {tierAllocation.map((trItem, i) => {
                                                        return (
                                                            <td key={`td${i}`}>
                                                                <MDBox display="flex" flexDirection="column" alignItems="center">
                                                                    <MDTypography variant="caption" fontWeight="medium" color="text">{`Tier ${i + 1}`}</MDTypography>
                                                                    <TextField placeholder="0"
                                                                        InputProps={{
                                                                            endAdornment: <InputAdornment disableTypography sx={{ fontSize: 13 }} position="end">%</InputAdornment>,
                                                                        }}
                                                                        sx={{ width: 72, mx: 0.2, "& .MuiInputBase-input": { textAlign: "center", paddingRight: 0 } }} id="trPortion" name="trPortion" value={trItem[i]}
                                                                        onChange={(e) => {
                                                                            handleTier(e.target.value, i)
                                                                        }}
                                                                        margin="dense" variant="outlined" >
                                                                    </TextField>
                                                                </MDBox>
                                                            </td>

                                                        )
                                                    })}
                                                </tr>
                                            </tbody>
                                        </table>
                                        {errors.tierAllocation && <MDTypography sx={{ marginTop: 1 }} variant="caption" color="error">Tier allocation portion should be between 0 and 100. Total for all tiers should be 100% </MDTypography>}
                                        <MDTypography sx={{ marginTop: 1, marginBottom: 1 }} variant="button" fontWeight="medium" color={"dark"}>Total:&nbsp;{isNaN(totalAllocatedPercentage) ? 0 : totalAllocatedPercentage}%</MDTypography>
                                    </>
                                )
                            }
                            {fetchingCount && (
                                <CircularProgress size={30} sx={{ marginTop: 1 }} color="info" />
                            )}
                            {!fetchingCount &&
                                <MDBox display="flex">
                                    {
                                        fetchingCountError && (
                                            <Alert severity="error"
                                                sx={{ marginTop: 1, marginBottom: 1, fontSize: "14px", textAlign: "left" }}
                                            >{'Error occured while fetching asset count'}</Alert>
                                        )
                                    }
                                    {
                                        !fetchingCountError && (
                                            <Alert severity={(listItemsCount || 0) === 0 ? "warning" : "info"}
                                                sx={{ marginTop: 1, fontSize: "14px", textAlign: "left" }}
                                            >
                                                Distributing to <strong>{`${listItemsCount || 0}`}</strong>{` ${_.startCase(destinationTableName)}(s)`}
                                            </Alert>
                                        )
                                    }
                                    <IconButton size="small" sx={{ marginTop: 1 }} onClick={() => fetchAssetCount(destinationTable)} title={`Click to refetch ${_.startCase(destinationTableName)} count`}><Icon color="text">refresh</Icon></IconButton>
                                </MDBox>
                            }
                        </>
                    )
                }
            </>
        );
    };

    return (
        <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            {showCondition && <ConditionBuilder conditionType={"Solutions"} yearFilter={yearFilter} monthFilter={monthFilter} conditionJson={condition} destinationTable={destinationTable} tableCols={tableCols} onConditionClose={handleConditionClose} onConditionSave={hanldeConditionSave} />}
            {
                !showListField && (
                    <MDButton
                        size="small"
                        sx={{ mt: 1, ml: 1, textTransform: "none" }}
                        variant="outlined"
                        color="info"
                        onClick={() => setShowListField(true)}>Distribute to Offering?</MDButton>
                )
            }
            {
                showListField && renderListConfig()
            }
        </MDBox>
    );
}

export default ListRule;