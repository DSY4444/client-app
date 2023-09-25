import Axios from "axios";
import YASkeleton from "components/YASkeleton";
import { getDomain } from "utils";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PopperComponent from "components/PopperComponent";
import { Icon, IconButton, Tooltip, Autocomplete, TextField, Checkbox, Chip } from "@mui/material";
import { useState, useEffect, useMemo } from "react";

const MultiSelect = (props) => {
    const { watch, setValue, disabled, formId, fieldDef: { name, displayName, required, variant, width, placeholder, dataSource, toolTip }, errorMessage, values , setError } = props;
    const [options, setOptions] = useState(dataSource.type === "static" ? dataSource.data : []);
    const [loading, setLoading] = useState(dataSource.type !== "static");
    const dataType = dataSource.type === "static" ? "select" : ''
    const watchAllFields = watch(dataSource.parentFields || []);
    let [value, setValues] = useState(values ? values.split(',') : [])

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
                    setOptions(response.data);
                }
            }
            else {
                let q = ("nc=" + Math.random()).replace(".", "");
                get_url += get_url.indexOf("?") > 0 ? `&${q}` : `?${q}`
                const response = await Axios.get(get_url);
                setOptions(response.data);
            }
            setLoading(false);
        }
        if (dataSource.type !== "static")
            getOptions();
    }, [parentFields]);

    if (loading) return <YASkeleton variant="dropdown" />

    const renderValues = (value, options) => {
        return (
            <>
                {value.map(val => {
                    const option = options.find(opt => opt.value === val);
                    if (option) {
                        return (
                            <Chip
                                key={option.value}
                                label={option.label}
                                sx={{m: 0.3}}
                            />
                        );
                    }
                    return null;
                })}
            </>
        );
    };
    
    return (
        <MDBox display="flex" flexDirection="column"
            sx={{
                "& .MuiAutocomplete-popper": {
                    boxShadow: "none"
                }
            }}
        >
            <Autocomplete
                multiple
                disableClearable={required}
                PopperComponent={PopperComponent}
                disabled={loading}
                options={options}
                renderTags={() => renderValues(value, options)}
                noOptionsText=""
                value={value}
                // inputValue={value}
                // isOptionEqualToValue={(option, value) => {
                //     if (typeof value === "number")
                //         return option.value === value
                //     if (typeof value === "string")
                //         return option.value?.toLowerCase() === value?.toLowerCase()
                //     return option.value === value.value
                // }}
                renderOption={(option, { selected }) => {
                    let valuestring = options.filter(opt => opt.label === option.key);
                    let isSelected = value.includes(valuestring[0].value)
                    const onClick = (e) => {
                        e.stopPropagation();
                        const updatedValues = isSelected
                            ? value.filter(elem => elem !== valuestring[0].value.toString())
                            : [...value, valuestring[0].value.toString()];
                        setValues(updatedValues);
                        if (errorMessage) {setError({})} 
                        setValue(name, updatedValues.join(','))
                    };

                    return (
                        <li key={option.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                                sx={{ p: 0, mr: 1, "& .MuiSvgIcon-root": { height: 16, width: 1, border: "1px solid #c5c9cc", borderRadius: dataType === "select" ? "4px" : "8px" } }}
                                checked={isSelected || selected}
                                onClick={(event) => { onClick(event) }}
                            />
                            <MDBox sx={theme => ({ flexGrow: 1, '& span': { color: theme.palette.mode === 'light' ? '#8b949e' : '#586069' } })}>
                                <MDTypography color="text" variant="subtitle2" fontWeight="small">  {option.key || option}</MDTypography>
                            </MDBox>
                        </li>
                    );
                }}


                getOptionLabel={option => {
                    if (typeof option === "number")
                        return options.find(op => op.value === option)?.label || "";
                    if (typeof option === "string")
                        return options.find(op => op.value?.toString().toLowerCase() === option?.toLowerCase())?.label || "";
                    return option?.label || ""
                }}
                renderInput={params =>
                    <>
                        <MDBox sx={{ "&:hover": { "& .helpIcon": { visibility: 'visible' } } }} display='flex' flexDirection='row'>
                            <TextField {...params}
                                name={name}
                                required={required}
                                disabled={disabled}
                                error={errorMessage &&  true}
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
        </MDBox>
    )
}
export default MultiSelect;