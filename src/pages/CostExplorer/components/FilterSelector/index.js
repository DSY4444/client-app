import { useState } from "react";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Checkbox, ClickAwayListener, Stack } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import PopperComponent from "components/PopperComponent";
import StyledPopper from "components/StyledPopper";
import StyledPopperSearchbox from "components/StyledPopperSearchbox";
import { useCostExplorerContext } from "context/CostExplorerContext";
import { setFilter } from "context/CostExplorerContext";
import MDButton from "components/MDButton";

const FilterSelector = (props) => {
    const { title, hideFilter, name, dataType, optionsLoading, onSearchVal, searchVal } = props;
    const [{ filters, filtersDataset }, dispatch] = useCostExplorerContext();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // useEffect(() => {
    //     console.log("filters", filters, filtersDataset)
    // }, [filtersDataset, filters]);


    const handleChange = (e) => {
        onSearchVal(e.target.value !== '' || null ? e.target.value : '')
        e.target.value = searchVal
    }

    const handleClick = (event) => {
        // onFilterChange(value);
        setAnchorEl(event.currentTarget);
    };

    const onClickAwayCallback = (event) => {
        if (event.target.localName === 'body') {
            return;
        }
        if (anchorEl.current && anchorEl.current.contains(event.target)) {
            return;
        }
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
    };

    const handleClose = () => {
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
    };


    const handleFilterOnSelection = (selectedItems) => {
        setFilter(dispatch, name, selectedItems);
    }

    const handleClearFilter = () => {
        handleFilterOnSelection(null);
    }

    const options = filtersDataset[name] || [];
    const selectedOptionValues = filters[name]?.map(v => options?.find(o => o.id === v)?.title);
    const allOptions = options.map(o => o.title);
    return <>
        <MDBox onClick={handleClick}>
            <Stack direction={"row"} justifyContent={"center"} spacing={.25}>
                <MDTypography variant="button" fontWeight="medium" color="dark" whiteSpace="nowrap">{title}</MDTypography>
                {
                    (!hideFilter || selectedOptionValues?.length > 0) && <Icon
                        sx={{ fontSize: "20px!important" }}
                        className={selectedOptionValues?.length > 0 ? "material-icons-round" : ""}
                    >
                        filter_alt
                    </Icon>
                }
            </Stack>
        </MDBox>
        <StyledPopper open={open} anchorEl={anchorEl} placement="bottom-start"
            modifiers={[
                {
                    name: 'offset',
                    options: {
                        offset: [0, 4],
                    },
                },
            ]}
        >
            <ClickAwayListener onClickAway={(e) => onClickAwayCallback(e)}>
                <MDBox display="flex" flexDirection="column"
                    sx={{
                        "& .MuiAutocomplete-popper": {
                            boxShadow: "none"
                        }
                    }}
                >
                    <Autocomplete
                        open
                        multiple
                        onClose={(event, reason) => {
                            if (reason === 'escape') {
                                handleClose();
                            }
                        }}
                        value={selectedOptionValues || []}
                        onChange={(event, newValue, reason) => {
                            if (
                                event.type === 'keydown' &&
                                event.key === 'Backspace' &&
                                reason === 'removeOption'
                            ) {
                                return;
                            }

                            const valueIds = newValue?.map(v => options?.find(o => o.title === v)?.id)

                            handleFilterOnSelection(valueIds);
                        }}
                        disableCloseOnSelect
                        PopperComponent={PopperComponent}
                        renderTags={() => null}
                        loading={optionsLoading}
                        noOptionsText="No options"
                        renderOption={(props, option, { selected }) => {
                            const { onClick, ...rest } = props;
                            return (
                                <li
                                    key={option}
                                    onClick={selected && dataType === "select" ? () => { } : onClick}
                                    {...rest}
                                >
                                    <Checkbox
                                        sx={{
                                            p: 0,
                                            mr: 1,
                                            "& .MuiSvgIcon-root": {
                                                height: 16,
                                                width: 16,
                                                border: "1px solid #c5c9cc",
                                                borderRadius: dataType === "select" ? "8px" : "4px"
                                            }
                                        }}
                                        checked={selected}
                                    />
                                    <MDBox
                                        sx={theme => ({
                                            flexGrow: 1,
                                            '& span': {
                                                color:
                                                    theme.palette.mode === 'light' ? '#586069' : '#8b949e',
                                            },
                                        })}
                                    >
                                        {option.title || option}
                                    </MDBox>
                                </li>
                            )
                        }}
                        options={allOptions}
                        // getOptionLabel={(option) => option}
                        getOptionLabel={(option) => {
                            return option?.title || option;
                        }}
                        renderInput={(params) => (
                            <StyledPopperSearchbox
                                ref={params.InputProps.ref}
                                value={searchVal}
                                inputProps={params.inputProps}
                                autoFocus
                                onChange={handleChange}
                                placeholder="Search..."
                            />
                        )}
                    />
                    <Stack direction="row-reverse" spacing={1}
                        sx={
                            theme => ({
                                p: 1.5,
                                borderTop: `1px solid ${theme.palette.mode === 'light' ? '#eaecef' : '#30363d'}`
                            })
                        }
                    >
                        <MDButton
                            name='clearSelection'
                            variant="text"
                            color="info"
                            sx={{
                                textTransform: "none",
                                marginRight: 'auto!important',
                                px: 1,
                                py: .5,
                                borderRadius: 1
                            }}
                            onClick={handleClearFilter}
                            disabled={selectedOptionValues?.length === 0}
                        >
                            Clear Selection
                        </MDButton>
                    </Stack>
                </MDBox>
            </ClickAwayListener>
        </StyledPopper>
    </>
}

export default FilterSelector;
