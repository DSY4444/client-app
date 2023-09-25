import { useState } from "react";

import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import { Checkbox, ClickAwayListener } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import PopperComponent from "components/PopperComponent";
import StyledPopper from "components/StyledPopper";
import StyledPopperSearchbox from "components/StyledPopperSearchbox";

const layerSelectorStyles = ({ palette: { white, text }, typography: { size } }) => ({
    cursor: 'pointer',
    border: '1px solid #ddd',
    borderRadius: 1.25,
    display: 'flex',
    flexDirection: 'row',
    minWidth: '150px',
    py: 1.25,
    pl: 1.25,
    alignItems: 'center',
    justifyContent: 'space-between',
    whiteSpace: 'nowrap',
    fontSize: '15px',
    // background: sessionFilters ? '#ffffff' : !dismissible ? '#cbd2eb!important' : defaultSelected ? '#626480!important' : '#fafafa!important',
    backgroundColor: white,
    height: 36,
    // overflow: 'hidden',
    position: 'relative',
    "&:hover": {
        // backgroundColor: sessionFilters ? '#cacaca!important'  : !dismissible ?  '#cbd2eb!important'  : defaultSelected ? '#eaeaea'  :  '#eaeaea',
        backgroundColor: 'none',
        // "& .fil": { 
        //     backgroundColor: !dismissible ? '#cbd2eb!important' : '#eaeaea',
        //     borderRadius: 1
        // },   
    },
    // "& .MuiTypography-root, & .MuiIcon-root": sessionFilters ? { color: '#435cc8!important' } : !dismissible ? { color: '#435cc8!important' } : defaultSelected ? { color: '#626480!important' } : '#eaeaea',
    "& .chipDesc": { pt: .25, maxWidth: 180, fontSize: size.xs, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'normal' },
    "& .closeIcon": { color: text.main, height: 32, width: 39, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '20px!important', marginTop: .25, marginLeft: .25 },
    "& .fil": {
        position: 'absolute',
        top: '-1em',
        zIndex: 999,
        left: '0.30em',
        fontSize: '13px',
        backgroundColor: '#ffffff',
        padding: '0 3px',
        "&:hover": {
            // backgroundColor: !dismissible ? '#cbd2eb!important' : '#eaeaea',
            // borderRadius: 1
        },
    }
})

const LayerSelector = (props) => {
    const { dataType, options, optionsLoading, onSearchVal, searchVal, onLayersSelection } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

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
        // if (newValue)
        //   setValue(newValue);
        // onFilterSelect(newValue);
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
        // setValue(null);
    };


    const handleFilterOnSelection = (selectedItems) => {
        // const selectedIds = selectedItems?.map(i => i.id) || [];
        onLayersSelection(selectedItems);
        // console.log('onFilterSelection', selectedItems);
    }
    
    const selectedOptions = options.filter(o => o.isSelected);
    const selectedOptionValues = options.filter(o => o.isSelected).map(o => o.title);
    const allOptions = options.map(o => o.title);
    const desc = (options?.length || 0) === selectedOptions?.length ? "All" : `${selectedOptions?.length} Selected`;
    return <>
        <MDBox
            onClick={handleClick}
            sx={(theme) => layerSelectorStyles(theme)}>
            <MDBox display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" flex={1}>
                <MDTypography variant="caption" className="chipDesc">{desc}</MDTypography>
                <Icon className="closeIcon">arrow_drop_down</Icon>
            </MDBox>
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

                            if (dataType === "select") {
                                handleFilterOnSelection([newValue[newValue.length - 1]]);
                                handleClose();
                            }
                            else
                                handleFilterOnSelection(newValue);
                        }}
                        disableCloseOnSelect
                        PopperComponent={PopperComponent}
                        renderTags={() => null}
                        loading={optionsLoading}
                        noOptionsText="No values"
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
                        options={allOptions || []}
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
                </MDBox>
            </ClickAwayListener>
        </StyledPopper>
    </>
}

export default LayerSelector;
