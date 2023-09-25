import { Checkbox, Icon, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import colors from "assets/theme/base/colors";
import { useState } from "react";

const ColumnOptions = ({ columnsDef, selectedColumnsInitial, widgetName, onOptionsApply, onOptionsClose }) => {

    const [selectedColumns, setSelectedColumns] = useState(selectedColumnsInitial || []);

    const onOptionChange = (e, name) => {
        let newSelected = [...selectedColumns];
        if (e.target.checked) {
            newSelected.push(name);
        } else {
            newSelected = selectedColumns.filter((n) => n !== name);
        }
        setSelectedColumns(newSelected);
    };

    const handleOnOptionsApply = () => {
        if(onOptionsApply){
            onOptionsApply(selectedColumns)
            if (widgetName.indexOf("undefined") === -1)
                sessionStorage[widgetName] = selectedColumns;
        }
        if(onOptionsClose) {
            onOptionsClose();
        }
    }

    return (
        <MDBox display="flex" flexDirection="column" borderLeft="1px solid rgba(0, 0, 0, 0.1)" minWidth={300} maxWidth={400} width="30%" height="100%" position="absolute" top={0} right={0} zIndex={3} 
            sx={{ 
                background: "white",
                boxShadow: "10px 0 8px 8px rgba(0, 0, 0, 0.4)"
            }}
        >
            <MDBox py={1.5} pl={2.5} pr={1} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                    <MDTypography variant="h6" component="span" color="text">Show/Hide Columns</MDTypography>
                </MDBox>
                <MDBox display="flex">
                    <IconButton onClick={onOptionsClose} title="Close">
                        <Icon>close</Icon>
                    </IconButton>
                </MDBox>
            </MDBox>
            <MDBox px={1.5} height="100%" sx={{overflowY: "auto"}}>
                {
                    columnsDef?.map(
                        (c) => (
                            !c.hidden &&
                            <MDBox px={1.5} py={0.2} key={c.name}>
                                {
                                c.mandatory &&
                                <Checkbox color="default" 
                                    sx={{
                                        p: 0,
                                        mr: 2,
                                        "& .MuiSvgIcon-root": {
                                            // height: 18,
                                            // width: 18,
                                            color: colors.grey[100],
                                            backgroundColor: colors.grey[300],
                                            // border: "1px solid #c5c9cc"
                                        }
                                    }}
                                    checked={selectedColumns.includes(c.name)}
                                // {...rest} 
                                />}
                                { !c.mandatory && 
                                <Checkbox
                                    color="primary"
                                    sx={{
                                        p: 0,
                                        mr: 2,
                                        "& .MuiSvgIcon-root": {
                                            height: 18,
                                            width: 18,
                                            border: "1px solid #c5c9cc"
                                        }
                                    }}
                                    checked={selectedColumns.includes(c.name)}
                                    onChange={(event) => onOptionChange(event, c.name)}
                                // {...rest} 
                                />}
                                <MDTypography variant="caption">
                                    {c.displayName}
                                </MDTypography>
                            </MDBox>
                        )
                    )
                }
            </MDBox>
            <MDBox backgroundColor="white" py={2} width="100%">
                <MDButton size="small" sx={{ marginLeft: 2.5 }} variant="gradient" color="info" onClick={handleOnOptionsApply}>
                    Apply
                </MDButton>
                <MDButton size="small" sx={{ marginLeft: 1 }} onClick={onOptionsClose}>
                    Close
                </MDButton>
            </MDBox>
        </MDBox>
    );
};

export default ColumnOptions;