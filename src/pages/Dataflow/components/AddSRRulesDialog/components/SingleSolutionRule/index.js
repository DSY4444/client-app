import _ from "lodash";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useState } from "react";
import ListRule from "../ListRule";

const SingleSolutionRule = (props) => {
  const [tierAllocation, setTierAllocation] = useState([0, 0, 0, 0, 0]);
  const [solutionSingle, setSolutionSingle] = useState("");
  const [destinationTable, setDestinationTable] = useState("");
  const [splitStrategy, setSplitStrategy] = useState(null);
  const [weightColumn, setWeightColumn] = useState("");
  const [condition, setCondition] = useState("");
  const [errors, setErrors] = useState({});
  const { enableAssetDistribution, yearFilter, monthFilter, costElementsRemaining, selectedRows, isSubmitting, submitRules, solutionNames } = props;

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

  const validateData = () => {
    var err = false;
    var e = {};
    if (selectedRows.length === 0) {
      e.selectedRows = true;
      err = true;
    }
    if (solutionSingle === "") {
      e.solutionSingle = true;
      err = true;
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

  const saveRules = async (evt) => {
    evt.preventDefault();
    const [err, e] = validateData();

    if (!err) {
      let ceSelected = [];
      if (splitStrategy === "byTier") {
        selectedRows?.forEach((i) => {
          tierAllocation?.forEach((trItem, j) => {
            if (trItem && trItem !== 0 && trItem !== "") {
              ceSelected.push({
                ...costElementsRemaining[i], "solutionTypeId": solutionSingle.split(" | ")[0], "solutionCategoryId": solutionSingle.split(" | ")[1], "solutionNameId": solutionSingle.split(" | ")[2], "id": null,
                "yearNameId": yearFilter, "monthNameId": monthFilter, "tier": 'Tier ' + (j + 1), "srlNo": (j + 1), "portion": (parseInt(trItem) / 100), "destinationTable": destinationTable, "condition": condition, "uploadedFileId": null, weight: weightColumn
              })
            }
          })
        });
      }
      else {
        ceSelected = selectedRows.map((i) => {
          return {
            ...costElementsRemaining[i], "solutionTypeId": solutionSingle.split(" | ")[0], "solutionCategoryId": solutionSingle.split(" | ")[1], "solutionNameId": solutionSingle.split(" | ")[2], "id": null,
            "yearNameId": yearFilter, "monthNameId": monthFilter, "tier": null, "srlNo": 1, "portion": 1, "destinationTable": destinationTable, "condition": condition, "uploadedFileId": null, "weight": weightColumn
          }
        });
      }

      submitRules(ceSelected);

    } else {
      setErrors(e);
    }

  }

  return (
    <MDBox height="100%" textAlign="center" pb={2} >
      <MDBox height="calc(100vh - 356px)" display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ overflowY: "auto" }}>
        <MDTypography variant="subtitle2" fontWeight="medium" color={errors?.solutionSingle ? "error" : "dark"}>{solutionSingle && solutionSingle !== "" ? "Allocating to Solution" : "Choose a Solution *"}</MDTypography>
        <TextField sx={{ minWidth: 300, pt: 0.5, pb: 1 }} name="solution" select margin="dense" variant="outlined"
          onChange={(e) => { setErrors({}); setSolutionSingle(e.target.value) }}
          value={solutionSingle}
          error={errors?.solutionSingle}
        >
          {solutionNames.map((item) => <MenuItem key={`${item["solutionCategory.solutionType.id"]} | ${item.solutionCategoryId} | ${item.id}`} value={`${item["solutionCategory.solutionType.id"]} | ${item.solutionCategoryId} | ${item.id}`}>{item["solutionCategory.solutionType.name"]} | {item["solutionCategory.name"]} | {item["name"]}</MenuItem>)}
        </TextField>
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
      {
        solutionSingle && solutionSingle !== "" && (
          <MDBox pt={1} sx={{ backgroundColor: "white" }}>
            <MDButton name="saveRules"
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

export default SingleSolutionRule;