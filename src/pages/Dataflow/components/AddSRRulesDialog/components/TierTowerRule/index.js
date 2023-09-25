import { CircularProgress, InputAdornment, MenuItem, TextField } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import _ from "lodash";
import { useState } from "react";
import ListRule from "../ListRule";

const TierTowerRule = (props) => {
    const [tierAllocation, setTierAllocation] = useState([0, 0, 0, 0, 0]);
    const [towerTier, setTowerTier] = useState("");
    const [destinationTable, setDestinationTable] = useState("");
    const [splitStrategy, setSplitStrategy] = useState(null);
    const [weightColumn, setWeightColumn] = useState("");
    const [condition, setCondition] = useState("");
    const [errors, setErrors] = useState({});

    const { yearFilter, monthFilter, costElementsRemaining, selectedRows, isSubmitting, submitRules, subTowers } = props;

    const handleClearAssetSelection = () => {
        setErrors({});
        setDestinationTable("");
        setSplitStrategy(null);
        setWeightColumn("");
        setCondition("");
    }

    const validateData = () => {
        var err = false;
        var e = {};
        if (selectedRows.length === 0) {
            e.selectedRows = true;
            err = true;
        }
        if (towerTier === "") {
            e.towerTier = true;
            err = true;
        }
        if (splitStrategy === "byWeight" && weightColumn === "") {
            e.weightColumn = true;
            err = true;
        }
        if (_.sum(tierAllocation) !== 100) {
            e.tierAllocation = true;
            err = true;
        }

        return [err, e];
    }

    const saveRules = async (evt) => {
        evt.preventDefault();
        const [err, e] = validateData();
        if (!err) {
            var ceSelected = [];
            selectedRows.map((i) => { // Tier 
                return tierAllocation.map((trItem, j) => {
                    if (trItem && trItem !== 0 && trItem !== "") {

                        ceSelected.push({
                            ...costElementsRemaining[i], "towerId": parseInt(towerTier.split(" | ")[0]), "subTowerId": parseInt(towerTier.split(" | ")[1]), "id": null,
                            "yearNameId": yearFilter, "monthNameId": monthFilter, tier: 'Tier ' + (j + 1), "portion": (parseInt(trItem) / 100), "destinationTable": destinationTable, "condition": condition, "uploadedFileId": null, weight: weightColumn
                        })
                    }
                })
            })

            submitRules(ceSelected);

        } else {
            setErrors(e);
        }

    }

    const handleTier = (value, i) => {
        var tr = [...tierAllocation];
        tr[i] = isNaN(parseInt(value)) ? 0 : parseInt(value);
        setTierAllocation(tr);
    }

    const totalAllocatedPercentage = _.sum(tierAllocation);

    return (
        <MDBox height="100%" textAlign="center" pb={2} >
            <MDBox height="calc(100vh - 356px)" display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ overflowY: "auto" }}>
                <MDTypography variant="subtitle2" fontWeight="medium" color={errors?.towerTier ? "error" : "dark"}>Choose a tower *</MDTypography>
                <TextField sx={{ minWidth: 300, pt: 0.5, pb: 1 }} placeholder="Choose a Tower & Sub Tower" name="tower" select margin="dense" variant="outlined"
                    onChange={(e) => { setErrors({}); setTowerTier(e.target.value) }}
                    value={towerTier}
                    error={errors?.towerTier}
                >
                    {subTowers.map((item) => <MenuItem key={`${item.towerId} | ${item.id}`} value={`${item.towerId} | ${item.id}`}>{item["tower.name"]} | {item["name"]}</MenuItem>)}
                </TextField>
                {
                    towerTier && towerTier !== "" && (
                        <ListRule
                            yearFilter={yearFilter}
                            monthFilter={monthFilter}
                            destinationTable={destinationTable}
                            splitStrategy={splitStrategy}
                            weightColumn={weightColumn}
                            condition={condition}
                            onDestinationTableChange={setDestinationTable}
                            onSplitStrategyChange={setSplitStrategy}
                            onWeightColumnChange={setWeightColumn}
                            onConditionChange={setCondition}
                            onClearAssetSelection={handleClearAssetSelection}
                            errors={errors}
                        />
                    )
                }
                {
                    towerTier && towerTier !== "" && (
                        <>
                            <MDTypography sx={{ marginTop: 3, marginBottom: 2 }} variant="subtitle2" fontWeight="medium" color={errors?.tierAllocation ? "error" : "dark"}>Allocate portion percentages to tiers *</MDTypography>
                            <table cellPadding={0} cellSpacing={0}>
                                <tbody>
                                    <tr>
                                        {tierAllocation.map((trItem, i) => {
                                            return (
                                                <td key={`td${i}`}>
                                                    <MDBox display="flex" flexDirection="column" alignItems="center">
                                                        <MDTypography variant="caption" fontWeight="medium" color="text">{`T ${i + 1}`}</MDTypography>
                                                        <TextField placeholder="0"
                                                            InputProps={{
                                                                endAdornment: <InputAdornment disableTypography sx={{ fontSize: 13 }} position="end">%</InputAdornment>,
                                                            }}
                                                            sx={{ width: 72, mx: 0.2, "& .MuiInputBase-input": { textAlign: "center", paddingRight: 0 } }} id="trPortion" name="trPortion" value={trItem[i]}
                                                            onChange={(e) => { setErrors({}); handleTier(e.target.value, i) }} margin="dense" variant="outlined" >
                                                        </TextField>
                                                    </MDBox>
                                                </td>

                                            )
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                            <MDTypography sx={{ marginTop: 1, marginBottom: 2 }} variant="button" fontWeight="medium" color={"dark"}>Total:&nbsp;{isNaN(totalAllocatedPercentage) ? 0 : totalAllocatedPercentage}%</MDTypography>
                            {errors.tierAllocation && <MDTypography variant="caption" color="error">Tier allocation portion should be between 0 and 100. Total for all tiers should be 100% </MDTypography>}
                        </>
                    )
                }
            </MDBox>
            {
                towerTier && towerTier !== "" && (
                    <MDBox pt={1} sx={{ backgroundColor: "white" }}>
                        <MDButton
                            name="saveRules"
                            variant="gradient"
                            color="info"
                            onClick={saveRules}
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress color="white" size={15} /> : undefined}
                        >
                            Save Rules
                        </MDButton>
                    </MDBox>
                )
            }
        </MDBox>
    );
};

export default TierTowerRule;