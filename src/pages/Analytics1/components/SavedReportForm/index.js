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

const SavedReportForm = (props) => {
    const { cubeId, reportId, query, config, mode, onClose } = props;
    const [loading, setLoading] = useState(false);
    const { showSnackbar, showAlert } = useYADialog();
    const { onDialogClose } = useContext(YADialogCustomFormContext);

    const { control, setValue, setError, formState: { errors, isSubmitting }, handleSubmit } = useForm();

    async function getFormData() {
        setLoading(true);
        const [error, data] = await fetchRequest.get(`/api/cube/report/${reportId}`);
        if (error)
            console.error(error);
        setValue("name", data["name"]);
        setValue("shared", data["shared"] || false);
        setLoading(false);
    }

    useEffect(() => {
        if (mode === "edit") {
            getFormData();
        }
        else {
            setValue("name", null);
            setValue("shared", true);
        }
    }, [mode]);

    const handleClose = useCallback((data) => {
        if (onClose) onClose(data);
    }, []);

    const onSubmit = async formdata => {
        if (mode !== "edit"){
            formdata.query = query || {};
            formdata.config = config || {};
        }
        const url = mode === "edit" ? `/api/cube/report/edit/${reportId}` : `/api/cube/${cubeId}/report/new`;
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
                handleClose({ reportId: data.reportId, reportName: data.reportName });
                onDialogClose();
                showSnackbar(data.message, "success");
            }
        }
        else {
            showAlert("Error", "Something went wrong. Contact your administrator.");
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
            </MDBox>
        )
    }

    return (
        <MDBox pt={1} px={3} pb={2} minWidth={400}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <MDBox role="form">
                    <MDBox mb={3}>
                        <Textbox setValue={setValue} control={control} fieldDef={{ name: "name", displayName: "Name" }} errorMessage={errors["name"] && errors["name"].message} />
                    </MDBox>
                </MDBox>
                <MDBox mb={3}>
                    <Switch setValue={setValue} control={control} fieldDef={{ name: "shared", displayName: "Share with Team?" }} errorMessage={errors["shared"] && errors["shared"].message} />
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

export default SavedReportForm;