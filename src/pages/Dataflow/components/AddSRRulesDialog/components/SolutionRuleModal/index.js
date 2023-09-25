import { Card, Icon, IconButton, InputAdornment, MenuItem, Modal, TextField } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import _ from "lodash";
import { useState } from "react";
import ListRule from "../ListRule";

const SolutionRuleModal = (props) => {
    const [tierAllocation, setTierAllocation] = useState([0, 0, 0, 0, 0]);
    const [solutionSingle, setSolutionSingle] = useState("");
    const [destinationTable, setDestinationTable] = useState("");
    const [portion, setPortion] = useState("");

    const [splitStrategy, setSplitStrategy] = useState(null);
    const [weightColumn, setWeightColumn] = useState("");
    const [condition, setCondition] = useState("");
    const [errors, setErrors] = useState({});

    const { enableAssetDistribution, yearFilter, monthFilter, selectedSolutions, solutionNames, onAddRuleSave, onAddRuleClose } = props;

    const handleClearAssetSelection = () => {
        setErrors({});
        setDestinationTable("");
        setSplitStrategy(null);
        setWeightColumn("");
        setCondition("");
        setTierAllocation([0, 0, 0, 0, 0]);
    }

    const handleOnSplitStrategyChange = (strategyValue) => {
        setTierAllocation([0, 0, 0, 0, 0]);
        setWeightColumn("");
        setSplitStrategy(strategyValue)
    }

    const handleAddRuleClose = () => {
        if (onAddRuleClose)
            onAddRuleClose()
    }

    const validateData = () => {
        var err = false;
        var e = {};

        if (solutionSingle === "") {
            e.solutionSingle = true;
            err = true;
        }
        var validatePortionText = /^([0-9]{1,2}\.[0-9]{1,2})$|^([0-9]{1,2})$/
        if ((isNaN(parseFloat(portion)) || portion === "" || (parseFloat(portion) <= 0 || parseFloat(portion) > 100))) {
            e.portion = true
            err = true;
        }
        if(!(validatePortionText.test(portion))) {
            e.portion = true
            err = true;
           if(portion==="100"){
            e.portion = false;
            err=false;
           } 
        }    
        if (splitStrategy === "byWeight" && weightColumn === "") {
            e.weightColumn = true;
            err = true;
        }
        if (splitStrategy === "byTier" && _.sum(tierAllocation) !== 100) {
            e.tierAllocation = true;
            err = true;
        }

        return [err, e];
    }

    const saveRule = async () => {
        const [err, e] = validateData();

        if (!err) {
            let sub = _.find(solutionNames, { 'solutionCategory.solutionType.id': parseInt(solutionSingle.split(" | ")[0]), 'solutionCategoryId': parseInt(solutionSingle.split(" | ")[1]), 'id': parseInt(solutionSingle.split(" | ")[2]) })
            const allocation = { name: solutionSingle, desc: sub["solutionCategory.solutionType.name"] + " | " + sub["solutionCategory.name"] + " | " + sub.name, portion: parseFloat(portion), destinationTable: destinationTable, condition: condition, splitStrategy: splitStrategy, weight: weightColumn, tierAllocation: tierAllocation };
            if (onAddRuleSave) {
                onAddRuleSave(allocation);
                handleAddRuleClose();
            }
        } else {
            setErrors(e);
        }
    }

    return (
        <Modal open={true} onClose={handleAddRuleClose}>
            <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
                <Card sx={{ minHeight: "450px", minWidth: "600px", overflow: 'hidden', padding:"15px"}}>
                    <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <MDBox>
                            <MDTypography variant="h6" component="span" color="text">Add Solution</MDTypography>
                        </MDBox>
                        <MDBox display="flex">
                            <IconButton onClick={handleAddRuleClose} title="Close">
                                <Icon>close</Icon>
                            </IconButton>
                        </MDBox>
                    </MDBox>
                    <MDBox height="100%" textAlign="center" pb={2} >
                        <MDBox pt={2} height="328px" display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ overflowY: "auto" }}>
                            <MDTypography variant="subtitle2" fontWeight="medium" color={errors?.solutionSingle ? "error" : "dark"}>Choose a solution and assign a portion percentage to it.</MDTypography>
                            <MDBox pt={2} display="flex" flexDirection="row" alignItems="center" justifyContent="center">
                                <TextField focused label="Solution" sx={{ minWidth: 300 }} name="solution" select margin="dense" variant="outlined"
                                    onChange={(e) => { setErrors({}); setSolutionSingle(e.target.value) }}
                                    value={solutionSingle}
                                    error={errors?.solutionSingle}
                                >
                                    {solutionNames.filter((item) => !selectedSolutions?.includes(`${item["solutionCategory.solutionType.id"]} | ${item.solutionCategoryId} | ${item.id}`)).map((item) => <MenuItem key={`${item["solutionCategory.solutionType.id"]} | ${item.solutionCategoryId} | ${item.id}`} value={`${item["solutionCategory.solutionType.id"]} | ${item.solutionCategoryId} | ${item.id}`}>{item["solutionCategory.solutionType.name"]} | {item["solutionCategory.name"]} | {item["name"]}</MenuItem>)}
                                </TextField>
                                <TextField focused
                                    InputProps={{
                                        endAdornment: <InputAdornment disableTypography sx={{ fontSize: 13 }} position="end">%</InputAdornment>,
                                    }}
                                    label="Portion" sx={{ width: 80, marginLeft: 0.5, textAlign: "center", paddingRight: 0 }} id="trPortion" name="trPortion" value={portion}
                                    onChange={(e) => { setErrors({}); setPortion(e.target.value) }} margin="dense" variant="outlined" >
                                </TextField>
                            </MDBox>
                            {errors && errors.portion && <MDTypography mt={1} variant="caption" color="error">Allocation Portion percentage should be between 0 and 100</MDTypography>}
                            {
                                enableAssetDistribution && solutionSingle && solutionSingle !== "" && (
                                    <ListRule
                                        solutionSingle={solutionSingle}
                                        yearFilter={yearFilter}
                                        monthFilter={monthFilter}
                                        destinationTable={destinationTable}
                                        splitStrategy={splitStrategy}
                                        weightColumn={weightColumn}
                                        tierAllocation={tierAllocation}
                                        condition={condition}
                                        onDestinationTableChange={setDestinationTable}
                                        onSplitStrategyChange={handleOnSplitStrategyChange}
                                        onWeightColumnChange={setWeightColumn}
                                        onTierAllocationChange={setTierAllocation}
                                        onConditionChange={setCondition}
                                        onClearAssetSelection={handleClearAssetSelection}
                                        errors={errors}
                                    />
                                )
                            }
                        </MDBox>
                        <MDBox pt={1} pr={2} sx={{ backgroundColor: "white", textAlign: "right" }}>
                            <MDButton name="saveRules" variant="gradient" color="info" onClick={saveRule}>Save Rule</MDButton>
                        </MDBox>
                    </MDBox>
                </Card>
            </MDBox>
        </Modal>
    );
};

export default SolutionRuleModal;