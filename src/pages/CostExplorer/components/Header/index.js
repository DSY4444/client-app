import { Autocomplete, Stack } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useCostExplorerContext } from "context/CostExplorerContext";
import { useCallback } from "react";
import { setHeaderFilter } from "context/CostExplorerContext";
import { toggleViewLayers } from "context/CostExplorerContext";
import LayerSelector from "../LayerSelector";
import { setLoading } from "context/CostExplorerContext";

const Header = () => {

    const [{ totalExpenditure, masterData, headerConfig }, dispatch] = useCostExplorerContext();

    const handleHeaderFilterOnChange = useCallback((name, value) => {
        setLoading(dispatch, true);
        setHeaderFilter(dispatch, name, value);
    }, []);

    const handleOnLayersSelection = useCallback((selectedIds) => {
        toggleViewLayers(dispatch, selectedIds);
    }, []);

    return (
        <MDBox pt={2} pb={1} px={3} display="flex">
            <MDBox flex={1} display="flex" alignItems="center" justifyContent="flex-start">
                <MDTypography component="span" fontWeight={"medium"} lineHeight={1.2}>Cost Explorer</MDTypography>
            </MDBox>
            <MDBox flex={1} display="flex" alignItems="center" justifyContent="center">
                {
                    totalExpenditure > 0 && (
                        <Stack direction="row" alignItems={"center"}>
                            <MDTypography ml={2} variant="caption" fontWeight="medium">View</MDTypography>
                            <Autocomplete
                                disableClearable={true}
                                value={headerConfig?.viewFilter}
                                options={headerConfig?.views || []}
                                onChange={(event, newValue) => {
                                    handleHeaderFilterOnChange("viewFilter", newValue.id);
                                }}
                                color="text"
                                fontWeight="medium"
                                sx={{
                                    ml: 1,
                                    "& .MuiOutlinedInput-root": {
                                        height: 36,
                                        minWidth: 150,
                                        padding: "4px 39px 4px 8px"
                                        // boxShadow: "0 8px 16px #1a488e1f"
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        fontSize: 12
                                    },
                                    "& .MuiOutlinedInput-input.MuiAutocomplete-input": {
                                        padding: .5
                                    }
                                }}
                                isOptionEqualToValue={(option, value) => {
                                    return option.id === value
                                }}
                                getOptionLabel={option => {
                                    if (typeof option === "number")
                                        return headerConfig?.views.find(op => op.id === option)?.name;
                                    return option.name
                                }}
                                renderInput={(params) => <MDInput {...params} />}
                            />
                            <MDTypography ml={2} mr={1} variant="caption" fontWeight="medium">Layers</MDTypography>
                            <LayerSelector options={headerConfig?.viewLayers} onLayersSelection={handleOnLayersSelection} />
                        </Stack>
                    )
                }
            </MDBox>
            <MDBox flex={1} display="flex" alignItems="center" justifyContent="flex-end">
                <Stack direction="row">
                    <Autocomplete
                        disableClearable={true}
                        value={headerConfig?.yearFilter}
                        options={masterData?.years || []}
                        onChange={(event, newValue) => {
                            handleHeaderFilterOnChange("yearFilter", newValue.id);
                        }}
                        color="text"
                        fontWeight="medium"
                        sx={{
                            ml: 1.5,
                            "& .MuiOutlinedInput-root": {
                                height: 36,
                                width: 110,
                                padding: "4px 39px 4px 8px"
                                // boxShadow: "0 8px 16px #1a488e1f"
                            },
                            "& .MuiOutlinedInput-input": {
                                fontSize: 12
                            },
                            "& .MuiOutlinedInput-input.MuiAutocomplete-input": {
                                padding: .5
                            }
                        }}
                        isOptionEqualToValue={(option, value) => {
                            return option.id === value
                        }}
                        getOptionLabel={option => {
                            if (typeof option === "number")
                                return masterData?.years.find(op => op.id === option)?.name;
                            return option.name
                        }}
                        renderInput={(params) => <MDInput {...params} />}
                    />
                    <Autocomplete
                        disableClearable={true}
                        value={headerConfig?.monthFilter}
                        options={masterData?.months || []}
                        onChange={(event, newValue) => {
                            handleHeaderFilterOnChange("monthFilter", newValue.id);
                        }}
                        color="text"
                        fontWeight="medium"
                        sx={{
                            ml: 1.5,
                            "& .MuiOutlinedInput-root": {
                                height: 36,
                                width: 100,
                                padding: "4px 39px 4px 8px"
                                // boxShadow: "0 8px 16px #1a488e1f"
                            },
                            "& .MuiOutlinedInput-input": {
                                fontSize: 12
                            },
                            "& .MuiOutlinedInput-input.MuiAutocomplete-input": {
                                padding: .5
                            }
                        }}
                        isOptionEqualToValue={(option, value) => {
                            return option.id === value
                        }}
                        getOptionLabel={option => {
                            if (typeof option === "number")
                                return masterData?.months.find(op => op.id === option)?.name;
                            return option.name
                        }}
                        renderInput={(params) => <MDInput {...params} />}
                    />
                </Stack>
            </MDBox>
        </MDBox>
    );
};

export default Header;