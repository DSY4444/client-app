import { Controller } from "react-hook-form";
import MDBox from "components/MDBox";
import { Icon, IconButton, Tooltip, FormControlLabel, Switch as MDSwitch } from "@mui/material";

const Switch = (props) => {
    const { control, setValue, disabled, fieldDef: { name, displayName, dependentFields, toolTip }, errorMessage, onChange: onChangeHook, handleAlert, formId  } = props;
    let reverseSet = formId && formId === "user"
    if (errorMessage)
        console.error(errorMessage)
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) =>
            <>
            <MDBox sx={ {"&:hover": { "& .helpIcon" : { visibility: 'visible' } }} } display='flex' flexDirection='row'>
                <FormControlLabel
                    control={
                        <MDSwitch name={name} disabled={disabled} checked={reverseSet ? !value : value}
                            variant="standard"
                            color="success"
                            onChange={
                                (_, checked) => {
                                    onChange(checked)
                                    if(handleAlert)
                                    { 
                                    handleAlert(checked, reverseSet)
                                    }
                                    onChange(reverseSet ? !checked : checked)
                                    if (!checked && dependentFields)
                                        dependentFields.forEach((f) => {
                                            setValue(f, null)
                                        });
                                    if (onChangeHook)
                                        onChangeHook(name, reverseSet ? !checked : checked);
                                }
                            }
                        />
                    }
                    label={displayName}
                    labelPlacement="start"
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

export default Switch;