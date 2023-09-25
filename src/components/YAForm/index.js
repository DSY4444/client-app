import { CircularProgress, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getDomain } from "utils";
import MDButton from "components/MDButton";
import Dropdown from "components/YAForm/components/Dropdown";
import DynamicDropdown from "./components/DynamicDropdown";
import MultiSelect from "./components/MultiSelect";
import Textbox from "components/YAForm/components/Textbox";
import Integer from "components/YAForm/components/Integer";
import Axios from "axios";
import Switch from "./components/Switch";
import YASkeleton from "components/YASkeleton";
import { useYADialog } from "components/YADialog";
import DatePicker from "./components/DatePicker";
import fetchRequest from "utils/fetchRequest";
import Float from "./components/Float";
import Rule from "./components/Rule";
import moment from "moment";

const YAForm = (props) => {
    const { dialog: { mode, pkId, definition }, onClose } = props;
    const formId = definition.name;
    const formFields = (definition.fields || []).filter(field => !field.hideInForm);

    const [fromAsset, setFromAsset] = useState(null)
    const [toAsset, setToAsset] = useState(null)
    const [fromAssetChange, setFromAssetChange] = useState(false)
    const [, setErrors] = useState({});
    const [onClear, setOnClear] = useState(false);
    const [condition, setCondition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState(null)
    const [err, setErr] = useState({})
    // const [defautValues, setDefautValues] = useState(buildDefaultValues(definition));
    const domain = getDomain();
    const { showSnackbar, showAlert } = useYADialog();
    const { watch, control, setValue, setError, formState: { errors, isSubmitting }, handleSubmit } = useForm({
        // defaultValues: defautValues
    });

    async function getFormData() {
        setLoading(true);
        const response = await Axios.get(`${domain}/api/master/${formId}/edit/${pkId}?${("nc=" + Math.random()).replace(".", "")}`);
        // setDefautValues(response.data);
        if (Array.isArray(formFields) && formFields.length > 0) {
            formFields.forEach((f) => {
                var val = response.data[f.name];
                if (f.dataSource?.consumptionAsset && f?.name === "fromAsset") {
                    setFromAsset(val.toLowerCase().replaceAll(" ",''))
                }
                if (f.dataSource?.consumptionAsset && f?.name === "toAsset") {
                    setToAsset(val.toLowerCase().replaceAll(" ",''))
                }
                if (f.type === "switch")
                    val = val || false;
                if (f.type === "datepicker" && val)
                    val = moment(val).format('YYYY-MM-DD');
                    f.schemaName === 'roles' && val === 'disabled' ? val = null : val
                setValue(f.name, val);
                if (f.type === 'multiselect') {
                    setValues(val)
                }
            });
        }
        setLoading(false);
    }

    const handleClearAssetSelection = () => {
        // setErrors({});
        // setFromAsset("");
        // setSplitStrategy(null);
        // setWeightColumn("");
        setCondition(null);
        // setTierAllocation([0, 0, 0, 0, 0]);
    }

    const onFromAssetChange = (value) => {
        setFromAsset(value)
        value === fromAsset ? setFromAssetChange(false) : setFromAssetChange(true)
        setCondition(null)
        setValues("")
    }

    useEffect(() => {
        if (mode === "edit") {
            getFormData();
        }
        else {
            if (Array.isArray(formFields) && formFields.length > 0) {
                formFields.forEach((f) => {
                    var defaultValue = null;
                    if (f.type === "switch")
                        defaultValue = f.defaultValue || false;
                    setValue(f.name, defaultValue);
                });
            }
        }
    }, [mode]);

    let handleAlert = (e, reverseSet) => {
        if (reverseSet && !e) {
            showAlert("Alert", "This action will result in the revocation of user access to the application");
        }
    }

    const onSubmit = async formData => {
        const url = mode === "edit" ? `${domain}/api/master/${formId}/${pkId}` : `${domain}/api/master/${formId}/new`;
        const [error, data] = await fetchRequest.post(url, JSON.stringify(formData));
        if (error) {
            if (error.data.message === "AdminRoleChangeFail") {
                showAlert("Attention", "Assign another admin before changing this user's role.")
            }
            else
            showAlert("Error", "Something went wrong. Contact your administrator.");
        }
        else {
            if (data && data.result === false) {
                if (Array.isArray(data.errors) && data.errors.length > 0) {
                    data.errors.forEach((e) => {
                        let errorfield = formFields.find(elem=>elem.name === e.field)
                        if(errorfield.type === 'multiselect')
                        {
                            setErr( { type: "manual", message: e.message })
                        }else
                        setError(e.field, { type: "manual", message: e.message });
                    });
                }
            }
            else {
                handleClose();
                if(formId){
                    if(formId === 'solution-offerings' || formId === 'business-units'){
                        let cubeVal = formId === "solution-offerings" ? "solutions" : "businessUnits"
                        var [err, refresh] = await fetchRequest.post(`/api/dataflow/cubeRefreshKey/${cubeVal}`);
                        if (err) {
                            console.err(err)
                        }
                        else {
                            showSnackbar(refresh, "success")
                        }
                    }
                    else if(formId === 'account' || formId === 'cost-center' || formId === 'vendor' ) {
                        let cubeVal = "all"
                        let [err1, refresh1] = await fetchRequest.post(`/api/dataflow/cubeRefreshKey/${cubeVal}`);
                        if (err) {
                            console.err(err1)
                        }
                        else {
                            showSnackbar(refresh1, "success")
                        }
                    }
                }
                showSnackbar(data.message, "success");
            }
        }
    };


    const handleClose = useCallback(() => {
        if (onClose) onClose();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <MDBox pt={1} px={2} minWidth={600}>
                    {
                        formFields.map((f) => (
                            <MDBox key={f.name}>
                                <YASkeleton variant="filter-item" />
                            </MDBox>)
                        )
                    }
                </MDBox>
            )
        }

        return (
            <MDBox pt={1} px={2} minWidth={600} overflow="auto">

                <form onSubmit={handleSubmit(onSubmit)} noValidate={true}>
                    <MDBox role="form">
                        {
                            formFields.map((f) => {
                                if (f.type === "multiselect") {
                                    return <MDBox mb={3} key={f.name}>
                                        <MultiSelect watch={watch} values={values} setValue={setValue} setError={setErr} control={control}  formId={formId} fieldDef={f} errorMessage={err.message} />
                                    </MDBox>
                                }
                                else if (f.type === "dropdown") {
                                    return <MDBox mb={3} key={f.name}>
                                        <Dropdown watch={watch} setValue={setValue} fromAsset={fromAsset} setFromAsset={onFromAssetChange} toAsset={toAsset} setToAsset={setToAsset} control={control} formId={formId} fieldDef={f} errorMessage={errors[f.name] && errors[f.name].message} />
                                    </MDBox>
                                }
                                else if (f.type === "dynamicdropdown") {
                                    return <MDBox mb={3} key={f.name}>
                                        <DynamicDropdown watch={watch} setValue={setValue} setFromAsset={onFromAssetChange} control={control} formId={formId} fieldDef={f} errorMessage={errors[f.name] && errors[f.name].message} />
                                    </MDBox>
                                }
                                else if (f.type === "textbox") {
                                    return <MDBox mb={3} key={f.name}>
                                        <Textbox watch={watch} setValue={setValue} control={control} formId={formId} fieldDef={f} errorMessage={errors[f.name] && errors[f.name].message} />
                                    </MDBox>
                                }
                                else if (f.type === "datepicker") {
                                    return <MDBox mb={3} key={f.name}>
                                        <DatePicker watch={watch} setValue={setValue} view={f.view ? f.view : ""} control={control} formId={formId} fieldDef={f} errorMessage={errors[f.name] && errors[f.name].message} />
                                    </MDBox>
                                }
                                else if (f.type === "integer" || f.type === "sequence") {
                                    return <MDBox mb={3} key={f.name}>
                                        <Integer watch={watch} setValue={setValue} control={control} formId={formId} fieldDef={f} errorMessage={errors[f.name] && errors[f.name].message} />
                                    </MDBox>
                                }
                                else if (f.type === "float") {
                                    return <MDBox mb={3} key={f.name}>
                                        <Float watch={watch} setValue={setValue} control={control} formId={formId} fieldDef={f} errorMessage={errors[f.name] && errors[f.name].message} />
                                    </MDBox>
                                }
                                else if (f.type === "currency") {
                                    return <MDBox mb={3} key={f.name}>
                                        <Float watch={watch} setValue={setValue} control={control} formId={formId} fieldDef={f} errorMessage={errors[f.name] && errors[f.name].message} />
                                    </MDBox>
                                }
                                else if (f.type === "switch") {
                                    return <MDBox mb={3} key={f.name}>
                                        <Switch watch={watch} setValue={setValue} control={control} formId={formId} fieldDef={f} errorMessage={errors[f.name] && errors[f.name].message} handleAlert={handleAlert}  />
                                    </MDBox>
                                }
                                else if (f.type === "rule") {
                                    return <MDBox mb={3} key={f.name}>
                                    <Rule 
                                        watch={watch}
                                        setValue={setValue}
                                        control={control}
                                        fromAsset={fromAsset}
                                        formId={formId}
                                        fieldDef={f}
                                        errorMessage={errors[f.name] && errors[f.name].message} 
                                        handleAlert={handleAlert}
                                        // splitStrategy={splitStrategy}
                                        // weightColumn={weightColumn}
                                        // tierAllocation={tierAllocation}
                                        condition={condition}
                                        onFromAssetChange={onFromAssetChange}
                                        fromAssetChange={fromAssetChange}
                                        // onSplitStrategyChange={handleOnSplitStrategyChange}
                                        // onWeightColumnChange={setWeightColumn}
                                        // onTierAllocationChange={setTierAllocation}
                                        setOnClear={setOnClear}
                                        onClear={onClear}
                                        onConditionChange={setCondition}
                                        onClearAssetSelection={handleClearAssetSelection}
                                        errors={errors}
                                        setErrors={setErrors}
                                    />
                                    </MDBox>
                                }
                                else {
                                    return <MDBox mb={3} key={f.name}>
                                        unknown field type
                                    </MDBox>
                                }
                            })
                        }
                    </MDBox>
                    <MDBox mt={4} mb={1} textAlign="right">
                        <MDButton type="submit" variant="gradient" color="info" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress color="white" size={15} /> : <Icon>save</Icon>}>
                            Save
                        </MDButton>
                    </MDBox>
                </form>
            </MDBox>
        );
    };

    return renderContent();
};

export default YAForm;