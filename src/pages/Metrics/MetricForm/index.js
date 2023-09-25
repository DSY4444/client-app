import { CircularProgress, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import MDButton from "components/MDButton";
import Textbox from "components/YAForm/components/Textbox";
import { YADialogCustomFormContext } from "components/YADialogCustomForm";
import { useYADialog } from "components/YADialog";
import fetchRequest from "utils/fetchRequest";
import Switch from "components/YAForm/components/Switch";
import YASkeleton from "components/YASkeleton";
import Dropdown from "components/YAForm/components/Dropdown";

const MetricForm = (props) => {
    const { metricId, mode, onClose } = props;
    const [loading, setLoading] = useState(false);
    const { showSnackbar, showAlert } = useYADialog();
    const { onDialogClose } = useContext(YADialogCustomFormContext);

    const { watch, control, setValue, setError, formState: { errors, isSubmitting }, handleSubmit } = useForm();

    async function getFormData() {
        setLoading(true);
        const [error, data] = await fetchRequest.get(`/api/metric/${metricId}`);
        if (error)
            console.error(error);
        setValue("name", data["name"]);
        setValue("desc", data["desc"]);
        setValue("query", data["query"]);
        setValue("type", data["type"]);
        setValue("config", data["config"]);
        setValue("active", data["active"] || false);
        setLoading(false);
    }

    useEffect(() => {
        if (mode === "edit") {
            getFormData();
        }
        else {
            setValue("active", true);
        }
    }, [mode]);

    const handleClose = useCallback((data) => {
        if (onClose) onClose(data);
    }, []);

    const onSubmit = async formdata => {
        const url = mode === "edit" ?
            `/api/metric/${metricId}`
            : `/api/metric/new`;

        const [error, data] = await fetchRequest.post(url, JSON.stringify(formdata));
        if (!error) {
            if (data && data.result === false) {
                if (Array.isArray(data.errors) && data.errors.length > 0) {
                    data.errors.forEach((e) => {
                        setError(e.field, { type: "manual", message: e.message });
                    });
                }
            }
            else {
                handleClose({ metricId: data.metricId });
                onDialogClose();
                showSnackbar(data.message, "success");
            }
        }
        else {
            showAlert("Create Dashboard", error?.data?.message || "Something went wrong. Contact your administrator.");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <MDBox pt={1} px={3} pb={2} minWidth={400}>
                <MDBox>
                    <YASkeleton variant="filter-item" />
                </MDBox>
                <MDBox>
                    <YASkeleton variant="filter-item" />
                </MDBox>
                <MDBox>
                    <YASkeleton variant="filter-item" />
                </MDBox>
                <MDBox>
                    <YASkeleton variant="filter-item" />
                </MDBox>
                <MDBox>
                    <YASkeleton variant="filter-item" />
                </MDBox>
                <MDBox>
                    <YASkeleton variant="filter-item" />
                </MDBox>
            </MDBox>
        )
    }

    return (
        <MDBox pt={1} px={3} pb={2} minWidth={400}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <MDBox>
                    <MDBox mb={3}>
                        <Textbox setValue={setValue} control={control} fieldDef={{ name: "name", displayName: "Metric Name", required: true }} errorMessage={errors["name"] && errors["name"].message} />
                    </MDBox>
                </MDBox>
                <MDBox>
                    <MDBox mb={3}>
                        <Textbox setValue={setValue} control={control} fieldDef={{ name: "desc", displayName: "Description" }} errorMessage={errors["desc"] && errors["desc"].message} />
                    </MDBox>
                </MDBox>
                <MDBox>
                    <MDBox mb={3}>
                        <Dropdown watch={watch} setValue={setValue} control={control} fieldDef={{ name: "type", displayName: "Data type", required: true, dataSource: { type: "static", data: [{ value: "Currency", label: "Currency" }, { value: "Integer", label: "Integer" }, { value: "Decimal", label: "Decimal" }, { value: "Percentage", label: "Percentage" }] } }} errorMessage={errors["type"] && errors["type"].message} />
                    </MDBox>
                </MDBox>
                <MDBox>
                    <MDBox mb={3}>
                        <Textbox textarea rows={8} setValue={setValue} control={control} fieldDef={{ name: "query", displayName: "Query", required: true }} errorMessage={errors["query"] && errors["query"].message} />
                    </MDBox>
                </MDBox>
                <MDBox>
                    <MDBox mb={3}>
                        <Textbox textarea rows={8} setValue={setValue} control={control} fieldDef={{ name: "config", displayName: "Config", required: true }} errorMessage={errors["config"] && errors["config"].message} />
                    </MDBox>
                </MDBox>
                <MDBox mb={1}>
                    <Switch setValue={setValue} control={control} fieldDef={{ name: "active", displayName: "Active" }} errorMessage={errors["active"] && errors["active"].message} />
                </MDBox>
                <MDBox mt={4} mb={1} textAlign="right">
                    <MDButton type="submit" disabled={isSubmitting} variant="gradient" color="info" startIcon={isSubmitting ? <CircularProgress color="white" size={15} /> : <Icon>save</Icon>}>
                        Save
                    </MDButton>
                </MDBox>
            </form>
        </MDBox>
    );
};

export default MetricForm;