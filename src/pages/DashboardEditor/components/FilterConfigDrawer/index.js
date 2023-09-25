import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Alert, Icon, Switch, TextField } from "@mui/material";
import MDButton from "components/MDButton";
import YAScrollbar from "components/YAScrollbar";
import { useCustomDashboardEditorContext } from "context/CustomDashboardEditorContext";
import { useCallback, useEffect } from "react";
import { useImmer } from "use-immer";
import { filterConfigChange } from "context/CustomDashboardEditorContext";
import DependentWidgetListItem from "../DependentWidgetListItem";
import { addFilterDependent } from "context/CustomDashboardEditorContext";
import { deleteFilterDependent } from "context/CustomDashboardEditorContext";
import { current } from "immer";

const FilterConfigDrawer = ({ selectedFilterId, onClose }) => {

    const [state, dispatch] = useCustomDashboardEditorContext();
    const [selectedFilter, setSelectedFilter] = useImmer(null);

    useEffect(() => {
        const selectedFilterVal = state.config?.filters?.find(f => f.queryName === selectedFilterId);
        if (selectedFilterVal)
            setSelectedFilter(selectedFilterVal);
    }, [selectedFilterId, state.config?.filters]);

    // useEffect(() => {
    //     if (selectedFilter)
    //         filterConfigChange(dispatch, selectedFilterId, selectedFilter);
    // }, [selectedFilter, selectedFilterId]);

    const handleAddWidgetAsDependant = useCallback((id) => {
        addFilterDependent(dispatch, selectedFilterId, id);
    }, [selectedFilterId]);

    const handleRemoveWidgetAsDependant = useCallback((id) => {
        deleteFilterDependent(dispatch, selectedFilterId, id);
    }, [selectedFilterId]);

    if (!selectedFilter)
        return <span></span>

    const widgets = state.config?.widgets?.filter(w => !["text", "header"].includes(w.vizState?.chartType)) || [];
    const dependentWidgets = widgets?.filter(w => (selectedFilter.dependencies || []).includes(w.id));
    const remainingWidgets = widgets?.filter(w => !(selectedFilter.dependencies || []).includes(w.id));

    return <MDBox
        minWidth={350}
        maxWidth={350}
        borderLeft="1px solid #ddd"
        backgroundColor="#fff!important"
        boxShadow="0 8px 16px #1a488e1f!important"
        position="fixed"
        right={0}
        bottom={0}
        top={0}
        zIndex={10}
    >
        <YAScrollbar>
            <MDBox
                position="sticky"
                top={0}
                zIndex={11}
                backgroundColor="#fff!important"
                display="flex"
                px={2.5}
                height={56}
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid #efeaea"
            >
                <MDTypography variant="h5" component="span" fontWeight="medium">
                    Global Filter Settings
                </MDTypography>
                <MDButton iconOnly onClick={onClose}>
                    <Icon sx={{ fontSize: "20px!important" }}>close</Icon>
                </MDButton>
            </MDBox>
            <MDBox px={2} pt={3} pb={2} minHeight="90vh" width="100%">
                <MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="caption" mx={.5} mb={1} display="block">Display Name</MDTypography>
                        <TextField
                            name={"filterDisplayName"}
                            value={selectedFilter.name || ""}
                            onChange={(event) => {
                                setSelectedFilter(draft => {
                                    draft.name = event.target.value
                                    filterConfigChange(dispatch, selectedFilterId, current(draft));
                                });

                            }}
                            fullWidth
                            size="small"
                            variant="outlined"
                            sx={{
                                "& .MuiOutlinedInput-input": {
                                    px: .75,
                                    py: .75
                                }
                            }}
                        />
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="caption" mx={.5} mb={1} display="block">Allow Multiple Selection</MDTypography>
                        <Switch checked={selectedFilter.filterType !== "select"}
                            name={"isMultiChoice"}
                            variant="standard"
                            size="small"
                            color="success"
                            sx={{
                                // mt: -.5,
                                "& .MuiSwitch-switchBase": {
                                    marginTop: "2px"
                                }
                            }}
                            onChange={
                                (_, checked) => {
                                    setSelectedFilter(draft => {
                                        draft.filterType = checked ? "dropdown" : "select";
                                        filterConfigChange(dispatch, selectedFilterId, current(draft));
                                    });
                                }
                            }
                        />
                    </MDBox>
                    {/* <MDBox mb={2}>
                        <MDTypography variant="caption" mx={.5} mb={1} display="block">Default Selected</MDTypography>
                        <Switch checked={selectedFilter.required || false}
                            name={"isMandatory"}
                            variant="standard"
                            size="small"
                            color="success"
                            sx={{
                                // mt: -.5,
                                "& .MuiSwitch-switchBase": {
                                    marginTop: "2px"
                                }
                            }}
                            onChange={
                                (_, checked) => {
                                    setSelectedFilter(draft => {
                                        draft.required = checked;
                                        filterConfigChange(dispatch, selectedFilterId, current(draft));
                                    });
                                }
                            }
                        />
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="caption" mx={.5} mb={1} display="block">Default Value</MDTypography>
                        <TextField
                            // name={item.name}
                            value={""}
                            // onChange={(event) => {
                            //     setSettingValue(event.target.value);
                            // }}
                            fullWidth
                            size="small"
                            variant="outlined"
                            sx={{
                                "& .MuiOutlinedInput-input": {
                                    px: .75,
                                    py: .75
                                }
                            }}
                        />
                    </MDBox> */}
                </MDBox>
                <MDBox mt={3}>
                    <MDTypography variant="button" fontWeight="medium">Dependent Widgets</MDTypography>
                    {
                        widgets.length === 0 && (
                            <Alert
                                severity={"warning"}
                                sx={{ mt: 1, mb: 2, py: 0, px: 1.5, fontSize: "13px", textAlign: "left", border: "1px solid #ddd", "& .MuiAlert-icon": { mr: 1 } }}
                            >
                                No widgets found.<br />
                                Note: Only widget types other than Header and Text can be added as dependents.
                            </Alert>
                        )
                    }
                    {
                        widgets.length > 0 && (
                            <Alert
                                severity={"info"}
                                sx={{ mt: 1, mb: 2, py: 0, px: 1.5, fontSize: "13px", textAlign: "left", border: "1px solid #ddd", "& .MuiAlert-icon": { mr: 1 } }}
                            >
                                Click on a widget to add or remove as a dependent widget.
                            </Alert>
                        )
                    }
                    <MDBox>
                        {
                            dependentWidgets?.map(w => (
                                <DependentWidgetListItem key={w.id} widget={w} removeFromSelection onClick={handleRemoveWidgetAsDependant} />
                            ))
                        }
                    </MDBox>
                    <MDBox>
                        {
                            remainingWidgets?.map(w => (
                                <DependentWidgetListItem key={w.id} widget={w} onClick={handleAddWidgetAsDependant} />
                            ))
                        }
                    </MDBox>
                </MDBox>
            </MDBox>
        </YAScrollbar>
    </MDBox>
}

export default FilterConfigDrawer;