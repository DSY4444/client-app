import { Alert, Autocomplete } from "@mui/material";
import AnimatedComponent from "components/AnimatedComponent";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

const fileTypeSelectStyles = () => ({
    width: 300,
    mt: 3,
    "& .MuiOutlinedInput-root": {
        boxShadow: "0 8px 16px #1a488e1f"
    },
    "& .MuiInputBase-input": {
        textAlign: "center"
    }
});

const SelectSheet = (props) => {
    const { sheetNames, onSheetSelection } = props;

    let sheetNameOptions = [];
    sheetNames?.forEach(sheetName => {
        sheetNameOptions.push(({ name: sheetName, displayName: sheetName }));
    });

    return (
        <MDBox flex={1} display="flex" alignItems="center" justifyContent="center">
            <MDBox display="flex" flexDirection="column" alignItems="center" mt={-4}>
                <MDTypography variant="subtitle1" fontWeight="light" color="text" component="span" >
                    Select the sheet you want to upload
                </MDTypography>

                <Autocomplete
                    disableClearable={true}
                    options={sheetNameOptions}
                    isOptionEqualToValue={(option, value) => {
                        return option.name === value
                    }}
                    getOptionLabel={option => {
                        if (typeof option !== "object")
                            return sheetNameOptions.find(op => op.name === option)?.displayName;
                        return option.displayName
                    }}
                    onChange={(_event, newValue) => {
                        if (onSheetSelection)
                            onSheetSelection(newValue.name);
                    }}
                    sx={() => fileTypeSelectStyles()}
                    renderInput={(params) => <MDInput placeholder="Choose one" {...params} sx={{ textAlign: "center" }} />}
                />
                <Alert
                    severity={"warning"}
                    sx={{ marginTop: 4, maxWidth: 400, fontSize: "14px", textAlign: "left", border: "1px solid #ddd" }}
                >
                    {`Your file contains more than one sheet. For a quicker ingestion, It is recommended to delete any extra sheets in the file.`}
                </Alert>
            </MDBox>
        </MDBox>
    )
};

export default AnimatedComponent(SelectSheet);