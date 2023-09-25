import { Controller } from "react-hook-form";
import MDBox from "components/MDBox";
import { Icon, IconButton, Tooltip, InputAdornment, TextField } from '@mui/material';

const Integer = (props) => {
    const { control, disabled, fieldDef: { name, displayName, required, variant, width, placeholder, suffixText, toolTip }, hideErrorMessage, errorMessage, onBlur: onBlurHook } = props;

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) =>
            <>
            <MDBox sx={ {"&:hover": { "& .helpIcon" : { visibility: 'visible' } }} } display='flex' flexDirection='row'>
                <TextField type="text" name={name} required={required} error={errorMessage ? true : false}
                    helperText={hideErrorMessage ? "" : errorMessage}
                    onChange={({ target: { value } }) => {
                        onChange(isNaN(parseInt(value)) ? value : parseInt(value));
                    }}
                    onBlur={({ target: { value } }) => {
                        onChange(isNaN(parseInt(value)) ? null : parseInt(value))
                        if (onBlurHook)
                            onBlurHook(name, value);
                    }}
                    value={value || ""}
                    label={displayName}
                    placeholder={placeholder}
                    variant={variant || "standard"}
                    sx={width ? { "& .MuiInputBase-root": { width: width } } : undefined}
                    fullWidth={width ? false : true}
                    disabled={disabled}
                    InputProps={suffixText ? {
                        endAdornment: <InputAdornment disableTypography sx={{ fontSize: 13 }} position="end">{suffixText}</InputAdornment>,
                    } : {}}
                />
                {toolTip?.length >= 0 && 
                    <IconButton className="helpIcon"
                        sx={({ palette: { text } }) => ({
                        // marginLeft: .15,
                        // marginBottom: 1,
                        marginRight: -2,
                        color: "#979191",
                        visibility: 'hidden',
                        "&:hover": {
                            color: text.main
                        }
                        })}
                        size="small"
                    //   onClick={() => {
                    //     // showinapphelp ? showinapphelp === 'true' ? openContextHelp(dispatch, pageName) :  window.open(helpCenterUrl+'/'+pageName,'yarkenhelp') :  window.open(helpCenterUrl+'/'+pageName,'yarkenhelp');
                    //     window.open(helpCenterUrl+'/'+pageName,'yarkenhelp');
                    //   }}
                    >
                        <Tooltip placement="left" title={toolTip ? toolTip : displayName}>
                            <Icon>help</Icon>
                        </Tooltip>
                    </IconButton>
                }
            </MDBox>
            </>}            
        />
    )
}

export default Integer;