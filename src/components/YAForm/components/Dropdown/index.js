import Axios from "axios";
import YASkeleton from "components/YASkeleton";
import { getDomain } from "utils";
import MDBox from "components/MDBox";
import { Icon, IconButton, Tooltip, Autocomplete, TextField } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";

const Dropdown = (props) => {
    const { watch, fromAsset, toAsset, setFromAsset, setToAsset, setValue, control, disabled, formId, fieldDef: { name, displayName, required, variant, width, placeholder, dataSource, toolTip }, errorMessage } = props;
    const [options, setOptions] = useState(dataSource.type === "static" ? dataSource.data : []);
    const [loading, setLoading] = useState(dataSource.type !== "static");

    const watchAllFields = watch(dataSource.parentFields || []);
    const parentFields = useMemo(() => {
        let parentFieldsObj = {};
      if (dataSource.parentFields) {
            dataSource.parentFields.forEach((f, i) => { parentFieldsObj[f] = watchAllFields[i] });
        }
        return parentFieldsObj;
        }, watchAllFields)

    useEffect(() => {
        async function getOptions() {
            setLoading(true);
            const domain = getDomain();
            let get_url = dataSource.type === "custom" ? `${domain}${dataSource.url}` : `${domain}/api/master/${formId}/${name}`
            if (dataSource.parentFields) {
                let hasEmpty = false;
                dataSource.parentFields.forEach((f) => {
                    if (!parentFields[f] && !hasEmpty) {
                        hasEmpty = true;
                    }
                    get_url = get_url.replace(new RegExp(`:${f}`, 'g'), parentFields[f] || 0)
                });

                if (hasEmpty) {
                    setOptions([]);
                } else {
                    let q = ("nc=" + Math.random()).replace(".", "");
                    get_url += get_url.indexOf("?") > 0 ? `&${q}` : `?${q}`
                    const response = await Axios.get(get_url);
                    if(name === 'toAsset') {
                        const modRes = response.data.map((a) => {
                            if(!a.value) {
                                a.value = a.displayName
                                a.label = a.displayName
                            }
                            return a
                        })
                        setOptions(modRes);
                    }else if(dataSource.consumptionAsset) {
                        const modRes = response.data.values.map((a) => {
                            let aObj = {}
                            if(!a.value) {
                                aObj.value = a
                                aObj.label = a
                            }
                            return aObj
                        })
                        setOptions(modRes);
                    }else {
                        setOptions(response.data);
                    }
                }
            }
            else {
                let q = ("nc=" + Math.random()).replace(".", "");
                get_url += get_url.indexOf("?") > 0 ? `&${q}` : `?${q}`
                const response = await Axios.get(get_url);
                const modRes = response.data.map((a) => {
                    if(!a.value) {
                        a.value = a.displayName
                        a.label = a.displayName
                    }
                    return a
                })
                setOptions(modRes);
            }
            setLoading(false);
        }
        if (dataSource.type !== "static")
            getOptions();
    }, [parentFields]);
   
    if (loading) return <YASkeleton variant="dropdown" />
    
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => {
                return <Autocomplete
                    disableClearable={required}
                    onChange={(event, item) => {
                        name === 'fromAsset' ? setFromAsset(item?.name) : name === 'toAsset' ? setToAsset(item?.name) : ''
                        onChange(item?.value || null );
                        if (dataSource.dependentFields)
                            dataSource.dependentFields.forEach((f) => {
                                setValue(f, null)
                              });
                    }}
                    disabled={loading}
                    options={name === 'toAsset' ? options.filter( option => option.name !== fromAsset) : name === 'fromAsset' ?  options.filter( option => option.name !== toAsset) : options}
                    value={value}
                    // inputValue={value}
                    // isOptionEqualToValue={(option, value) => {
                    //     if (typeof value === "number")
                    //         return option.value === value
                    //     if (typeof value === "string")
                    //         return option.value?.toLowerCase() === value?.toLowerCase()
                    //     return option.value === value.value
                    // }}
                    getOptionLabel={option => {
                        if (typeof option === "number")
                            return options.find(op => op.value === option)?.label || "";
                        if (typeof option === "string")
                        return options.find(op => op.value?.toString().toLowerCase() === option?.toLowerCase())?.label || "";
                        return option?.label || ""
                    }}
                    renderInput={params => 
                        <>
                        <MDBox sx={ {"&:hover": { "& .helpIcon" : { visibility: 'visible' } }} } display='flex' flexDirection='row'>
                        <TextField {...params}
                            name={name}
                            required={required}
                            disabled={disabled}
                            error={errorMessage && true}
                            helperText={errorMessage}
                            label={displayName}
                            placeholder={placeholder}
                            variant={variant || "standard"}
                            sx={width ? { width: width } : undefined}
                            fullWidth={width ? false : true}
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
                        </>
                    }
                />
            }
            }
        />
    )
}

export default Dropdown;