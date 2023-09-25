import { CircularProgress, Icon, IconButton, Tooltip } from "@mui/material";
import DataTable from "components/DataTable";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import _ from "lodash";
import { useState } from "react";
import SolutionRuleModal from "../SolutionRuleModal";

const MultiSolutionRule = (props) => {
    const [showAddRuleModal, setShowAddRuleModal] = useState(false)
    const [errors, setErrors] = useState({});
    const [rows, setRows] = useState([]);
    const { enableAssetDistribution, yearFilter, monthFilter, costElementsRemaining, selectedRows, isSubmitting, submitRules, solutionNames } = props;

    const validateData = () => {
        var err = false;
        var e = {};
        if (selectedRows.length === 0) {
            e.selectedRows = true;
            err = true;
        }
        if (rows.length === 0) {
            e.rows = true;
            err = true;
        }
        if (_.sumBy(rows, (o) => { return parseFloat(o.portion) }) !== 100) {
            e.rows = true;
            err = true;
        }

        return [err, e];
    }

    const saveRules = async (evt) => {
        evt.preventDefault();
        const [err, e] = validateData();

        if (!err) {
            let ceSelected = []
            selectedRows?.forEach((i) => {
                rows?.forEach((twItem, idx) => {
                    if (twItem.splitStrategy === "byTier") {
                        twItem.tierAllocation?.forEach((trItem, j) => {
                            if (trItem && trItem !== 0 && trItem !== "") {
                                ceSelected.push({
                                    ...costElementsRemaining[i], 'solutionTypeId': parseInt(twItem.name.split(" | ")[0]), 'solutionCategoryId': parseInt(twItem.name.split(" | ")[1]), 'solutionNameId': parseInt(twItem.name.split(" | ")[2]), "id": null,
                                    "yearNameId": yearFilter, "monthNameId": monthFilter, "tier": 'Tier ' + (j + 1), "srlNo": ((idx + 1) * 10 + j + 1), "portion": ((parseInt(trItem) / 100) * parseFloat(twItem.portion)) / 100, "destinationTable": twItem.destinationTable, "destinationTableName": twItem.destinationTableName, "condition": twItem.condition, "uploadedFileId": null, "weight": twItem.weight
                                })
                            }
                        })
                    }
                    else {
                        ceSelected.push({
                            ...costElementsRemaining[i], 'solutionTypeId': parseInt(twItem.name.split(" | ")[0]), 'solutionCategoryId': parseInt(twItem.name.split(" | ")[1]), 'solutionNameId': parseInt(twItem.name.split(" | ")[2]), "id": null,
                            "yearNameId": yearFilter, "monthNameId": monthFilter, "tier": null, "srlNo": (idx + 1), "portion": (parseFloat(twItem.portion) / 100), "destinationTable": twItem.destinationTable, "destinationTableName": twItem.destinationTableName, "condition": twItem.condition, "uploadedFileId": null, "weight": twItem.weight
                        })
                    }
                })
            })

            submitRules(ceSelected);

        } else {
            setErrors(e);
        }

    }

    const onAddRuleClose = () => {
        setShowAddRuleModal(false)
    }

    const onAddRuleSave = (rule) => {
        let newRows = [...rows];
        newRows.push(rule);
        setRows(newRows);
    }

    const handleAdd = () => {
        setErrors({})
        setShowAddRuleModal(true);
    }

    const handleDelete = (item) => {
        setErrors({})
        let newRows = rows?.filter(r => r.name !== item.name);
        setRows(newRows);
    }

    const multiSolutionColumns = enableAssetDistribution ?
        [
            { Header: "", accessor: "name", width: 70, disableSorting: true, Cell: ({ row }) => { return <IconButton onClick={() => handleDelete(row.values)} sx={{ padding: 0 }}><Icon color="error">delete</Icon></IconButton> } },
            { Header: "Solution", accessor: "desc", disableSorting: true, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Portion", accessor: "portion", disableSorting: true, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{`${value}%`}</MDTypography> } },
            { Header: "Asset", accessor: "destinationTable", disableSorting: true, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{_.startCase(value)}</MDTypography> } },
            { Header: "Split", accessor: "weight", disableSorting: true, Cell: ({ row: { original } }) => { return <MDTypography variant="caption" color="dark">{((original?.destinationTable || "") !== "" ? ((original?.weight || "") !== "" ? `By Weight(${_.startCase(original?.weight)})` : "Equally") : "")}</MDTypography> } },
            { Header: "Condition", accessor: "condition", disableSorting: true, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{(value || "") !== "" && <Tooltip title={value}><Icon fontSize="medium" color="text">info</Icon></Tooltip>}</MDTypography> } },
        ]
        : [
            { Header: "", accessor: "name", width: 70, disableSorting: true, Cell: ({ row }) => { return <IconButton onClick={() => handleDelete(row.values)} sx={{ padding: 0 }}><Icon color="error">delete</Icon></IconButton> } },
            { Header: "Solution", accessor: "desc", disableSorting: true, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Portion", accessor: "portion", disableSorting: true, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{`${value}%`}</MDTypography> } },
        ];

    const selectedSolutions = rows?.map(r => r.name) || [];

    return (
        <MDBox height="100%" width="100%" textAlign="center" >
            {showAddRuleModal && <SolutionRuleModal enableAssetDistribution={enableAssetDistribution} yearFilter={yearFilter} monthFilter={monthFilter} costElementsRemaining={costElementsRemaining} selectedRows={selectedRows} selectedSolutions={selectedSolutions} submitRules={submitRules} solutionNames={solutionNames} onAddRuleSave={onAddRuleSave} onAddRuleClose={onAddRuleClose} />}
            <MDBox height="calc(100vh - 330px)" width="100%" display="flex" flexDirection="column" alignItems="center" justifyContent={rows && rows.length > 0 ? "flex-start" : "center"}>
                <MDBox pt={1} pb={1} width="100%" display="flex" flexDirection="column" alignItems="flex-start" sx={{ overflow: "auto" }}>
                    {
                        rows && rows.length > 0 && (
                            <>
                                <MDButton size="small" startIcon={<Icon size="medium" fontSize="medium">add</Icon>} variant="text" color="info" onClick={handleAdd} sx={{ marginBottom: 1, marginRight: 2, alignSelf: "flex-end" }}>Add Solution</MDButton>
                                <DataTable
                                    variant="tile"
                                    table={{ columns: multiSolutionColumns, rows }}
                                    // containerMaxHeight={424}
                                    showTotalEntries={false}
                                    isSorted={false}
                                    noEndBorder
                                    entriesPerPage={false}
                                    canSearch={false}
                                />
                            </>
                        )
                    }
                    {errors && errors.rows && <MDBox py={1} width="100%" textAlign="center"> <MDTypography variant="caption" color="error">Allocated portions should sum-up to 100%</MDTypography></MDBox>}
                </MDBox>
                {
                    (!rows || rows.length === 0) && (
                        <MDButton sx={{ width: 300, marginTop: 6 }} startIcon={<Icon>add</Icon>} variant="outlined" color="info" onClick={handleAdd}>Add Solution</MDButton>
                    )
                }
            </MDBox>
            {
                rows && rows.length > 0 && (
                    <MDBox py={1} sx={{ backgroundColor: "white" }}>
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

export default MultiSolutionRule;