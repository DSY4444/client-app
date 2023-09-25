import { Icon } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useState } from "react";
import { styled } from '@mui/material/styles';
import { ClickAwayListener, Popper } from "@mui/material";

const chartTypeDropdownStyles = () => ({
    maxWidth: 235,
    minWidth: 235,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    pl: 1.2,
    pr: 1,
    py: .5,
    mx: 1.5,
    mt: 1,
    cursor: "pointer",
    borderRadius: "10px",
    border: "1px solid #ddd",
    "& .selectionBox": {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    "& .icon": {
        fontSize: "36px!important",
        color: "#adadad",
        mr: 1.5
    },
    "& .rotate90deg": {
        transform: "rotateZ(90deg)"
    },
});

const chartTypeDropdownOptionStyles = ({ palette: { info } }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    mx: 1.5,
    py: 1,
    cursor: "pointer",
    borderBottom: "1px solid #faf3f3",
    "&:hover .icon, &:hover .subtitle": {
        color: info.main,
        fontWeight: "medium"
    },
    "& .selectionBox": {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    "& .icon": {
        fontSize: "34px!important",
        color: "#adadad",
        mr: 1.5
    },
    "& .rotate90deg": {
        transform: "rotateZ(90deg)"
    },
    "&:last-child": {
        pb: 1,
        borderBottom: 'none'
    },
});

const StyledPopper = styled(Popper)(({ theme }) => ({
    border: `1px solid ${theme.palette.mode === 'light' ? '#e1e4e8' : '#30363d'}`,
    boxShadow: `0 8px 24px ${theme.palette.mode === 'light' ? 'rgba(149, 157, 165, 0.2)' : 'rgb(1, 4, 9)'}`,
    borderRadius: 10,
    width: 235,
    zIndex: theme.zIndex.modal,
    fontSize: 13,
    color: theme.palette.mode === 'light' ? '#24292e' : '#c9d1d9',
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1c2128',
}));


const ChartTypesDropdown = ({ value, chartTypes, onChange }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        // setPendingValue(value);
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        // setValue(pendingValue);
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
    };

    const handleOptionClick = (value) => {
        if (onChange)
            onChange(value);
        handleClose();
    };

    const selectedChartType = chartTypes?.find(c => c.type === value);

    return (
        <MDBox>
            <MDBox
                sx={(theme) => chartTypeDropdownStyles(theme)}
                onClick={handleClick}
            >
                <MDBox className="selectionBox">
                    <Icon className={`icon${selectedChartType?.rotateIcon90deg ? " rotate90deg" : ""}`}>{selectedChartType?.icon}</Icon>
                    <MDTypography className="subtitle" variant="button" color="text">{selectedChartType?.title}</MDTypography>
                </MDBox>
                <Icon sx={{ ml: 1.5, fontSize: "32px!important", color: "rgba(0, 0, 0, 0.54)" }}>keyboard_arrow_down</Icon>
            </MDBox>
            <StyledPopper
                open={open}
                anchorEl={anchorEl}
                placement="bottom-start"
                modifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [0, -50],
                        },
                    },
                ]}
                sx={{ maxHeight: "calc(100vh - 296px)", overflowY: "auto" }}
            >
                <ClickAwayListener onClickAway={handleClose}>
                    <MDBox>
                        {
                            chartTypes?.map(c => (
                                <MDBox
                                    key={c?.type}
                                    sx={(theme) => chartTypeDropdownOptionStyles(theme)}
                                    onClick={c?.type === value ? undefined : () => handleOptionClick(c?.type)}
                                >
                                    <MDBox className="selectionBox">
                                        <Icon className={`icon${c?.rotateIcon90deg ? " rotate90deg" : ""}`}>{c?.icon}</Icon>
                                        <MDTypography className="subtitle" variant="button" color="text">{c?.title}</MDTypography>
                                    </MDBox>
                                    {
                                        c?.type === value && (
                                            <Icon color="info" sx={{ ml: "auto", mr: 1 }}>check_circle</Icon>
                                        )
                                    }
                                </MDBox>
                            ))
                        }
                    </MDBox>
                </ClickAwayListener>
            </StyledPopper>
        </MDBox>
    )
};

export default ChartTypesDropdown;

