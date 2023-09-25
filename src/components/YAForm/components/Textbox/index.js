import { Controller } from "react-hook-form";
import { Icon, IconButton, Tooltip, InputAdornment, TextField } from "@mui/material";
import MDBox from "components/MDBox";

const Textbox = (props) => {
    const { control, textarea, rows, fieldDef: { name, displayName, required, variant, width, placeholder, suffixText, toolTip , readOnly }, errorMessage } = props;
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) =>
            <>
            <MDBox sx={ {"&:hover": { "& .helpIcon" : { visibility: 'visible' } }} } display='flex' flexDirection='row'>
                <TextField
                    type="text"
                    multiline={textarea}
                    rows={textarea ? rows || 3 : 1}
                    name={name}
                    value={value || ""}
                    label={displayName}
                    placeholder={placeholder}
                    required={required}
                    error={errorMessage && true}
                    helperText={errorMessage}
                    onChange={onChange}
                    variant={variant || "standard"}
                    sx={width ? { "& .MuiInputBase-root": { width: width } } : undefined}
                    disabled={readOnly}
                    fullWidth={width ? false : true}
                    InputProps={suffixText ? {
                        endAdornment: <InputAdornment disableTypography sx={{ fontSize: 13 }} position="end">{suffixText}</InputAdornment>,
                    } : {}}
                />
                {toolTip?.length >= 0 && 
                    <IconButton className="helpIcon"
                        sx={({ palette: { text } }) => ({
                        // marginLeft: .15,
                        // marginBottom: .1,
                        marginRight: -2,
                        color: "#979191",
                        visibility: 'hidden',
                        "&:hover": {
                            color: text.main
                        }
                        })}
                        size="small"
                        // onClick={() => {
                        //     // showinapphelp ? showinapphelp === 'true' ? openContextHelp(dispatch, pageName) :  window.open(helpCenterUrl+'/'+pageName,'yarkenhelp') :  window.open(helpCenterUrl+'/'+pageName,'yarkenhelp');
                        //     window.open(helpCenterUrl+'/'+pageName,'yarkenhelp');
                        // }}
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

export default Textbox;