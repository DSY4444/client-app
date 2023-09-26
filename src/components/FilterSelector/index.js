import { useState } from "react";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import { ClickAwayListener } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import MDButton from "components/MDButton";
import { useTheme } from "@emotion/react";
import StyledPopper from "components/StyledPopper";
import StyledPopperSearchbox from "components/StyledPopperSearchbox";
import PopperComponent from "components/PopperComponent";

const FilterSelector = (props) => {
    const { fields, onFilterSelect, headerShadow } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'filters-label' : undefined;
    const theme = useTheme();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleFilterSelection = (newValue) => {
        if (onFilterSelect)
            onFilterSelect(newValue);
        handleClose();
    }

    const handleClose = () => {
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
    };

    return (
        <>
            <MDButton
                disableRipple
                aria-describedby={id}
                // size="large"
                startIcon={<Icon fontSize="medium">add</Icon>}
                sx={{ height: 36, ml: .5, mt: headerShadow ? 2.5 : '', textTransform: 'none', fontSize: 13, p: 1.5 }}
                variant="text"
                color="info"
                onClick={handleClick}
                disabled={fields?.length === 0}
            >
                Add Filter
            </MDButton>
            <StyledPopper id={id} open={open} anchorEl={anchorEl} placement="bottom-start"
                modifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 4],
                        },
                    },
                ]}
            >
                <ClickAwayListener onClickAway={() => handleClose()}>
                    <div>
                        <Autocomplete
                            open
                            multiple
                            onClose={(event, reason) => {
                                if (reason === 'escape') {
                                    handleClose();
                                }
                            }}
                            onChange={(event, newValue, reason) => {
                                if (
                                    event.type === 'keydown' &&
                                    event.key === 'Backspace' &&
                                    reason === 'removeOption'
                                ) {
                                    return;
                                }
                                handleFilterSelection(newValue[0]);
                            }}
                            disableCloseOnSelect
                            PopperComponent={PopperComponent}
                            renderTags={() => null}
                            noOptionsText="No fields"
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <MDBox
                                        sx={{
                                            flexGrow: 1,
                                            '& span': {
                                                color:
                                                    theme.palette.mode === 'light' ? '#586069' : '#8b949e',
                                            },
                                        }}
                                    >
                                        {option.Header || option.name}
                                    </MDBox>
                                </li>
                            )}
                            options={fields}
                            getOptionLabel={(option) => option.name || option.Header}
                            renderInput={(params) => (
                                <StyledPopperSearchbox
                                    ref={params.InputProps.ref}
                                    inputProps={params.inputProps}
                                    autoFocus
                                    placeholder="Search"
                                />
                            )}
                        />
                    </div>
                </ClickAwayListener>
            </StyledPopper>
        </>
    )
};

export default FilterSelector;
