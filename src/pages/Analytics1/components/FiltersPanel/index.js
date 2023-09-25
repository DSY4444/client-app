import { List, MenuItem, Select } from "@mui/material";
import CubeFilter from "components/CubeFilter";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { memo } from "react";
import { useDrop } from "react-dnd";
import { DataFieldTypes } from "components/DataField";

const conditionTypeStyles = ({ palette: { text, grey }, functions: { pxToRem } }) => {
    return {
        my: .7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: "center",
        "& .MuiOutlinedInput-root fieldset": {
            border: 'none'
        },
        "& .MuiSelect-select": {
            color: text.main,
            fontWeight: "600",
            px: 1,
            py: .25,
            paddingRight: `${pxToRem(24)}!important`,
        },
        "& .MuiSelect-select:hover": {
            backgroundColor: grey[200],
        }
    }
};

const ConditionType = memo(({ conditionType, onConditionTypeChange }) => {
    const handleChange = (event) => {
        if (onConditionTypeChange)
            onConditionTypeChange(event.target.value);
    };

    return <MDBox component="li" sx={(theme) => conditionTypeStyles(theme)}>
        <Select
            value={conditionType || "and"}
            onChange={handleChange}
            size="small"
        >
            <MenuItem value="and">And</MenuItem>
            <MenuItem value="or">Or</MenuItem>
        </Select>
    </MDBox>
});

const FiltersPanel = memo(({ filters, filterConditionType, onFilterConditionTypeChange, onFilterDrop, onFilterDelete, onFilterChange }) => {
    const [{ isOver, canDrop }, dropRef] = useDrop({
        accept: [DataFieldTypes.DIMENSION, DataFieldTypes.MEASURE],
        drop: (item) => onFilterDrop(item),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        })
    });

    let borderVal = '2px dashed #ddd'
    const isActive = isOver && canDrop
    if (isActive) {
        borderVal = '3px solid #4CAF50'
    } else if (canDrop) {
        borderVal = '3px solid #67bb6a'
    }
    return (
        <MDBox px={1.5}>
            <List sx={{ pt: 1 }}>
                {
                    filters && filters?.map((f, i) =>
                        <MDBox key={f.name}>
                            <CubeFilter key={f.name} filterDef={f} onFilterDelete={onFilterDelete} onFilterChange={onFilterChange} />
                            {
                                filters.length !== i + 1 &&
                                <ConditionType
                                    key={f.name}
                                    conditionType={filterConditionType}
                                    onConditionTypeChange={onFilterConditionTypeChange}
                                />
                            }
                        </MDBox>
                    )
                }
            </List>
            <MDBox ref={dropRef} px={.5} my={2} border={borderVal} borderRadius="6px" minHeight={50} display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                <MDTypography data-testid = {"Drop field here".toLowerCase().replaceAll(' ', '')} py={.75} variant="caption" color="text">Drop field here</MDTypography>
            </MDBox>
        </MDBox >
    )
});

export default FiltersPanel;