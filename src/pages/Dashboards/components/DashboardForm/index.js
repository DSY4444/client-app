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

const DashboardForm = (props) => {
    const { dashboardId, mode, copyText, onClose } = props;
    const [loading, setLoading] = useState(false);
    const { showSnackbar, showAlert } = useYADialog();
    const { onDialogClose } = useContext(YADialogCustomFormContext);

    const { control, setValue, setError, formState: { errors, isSubmitting }, handleSubmit } = useForm();

    async function getFormData() {
        setLoading(true);
        const [error, data] = await fetchRequest.get(`/api/dashboard/custom/${dashboardId}`);
        if (error)
            console.error(error);
        setValue("displayName", data["displayName"]);
        setValue("shared", data["shared"] || false);
        setValue("editable", data["editable"] || false);
        setLoading(false);
    }

    useEffect(() => {
        if (mode === "edit") {
            getFormData();
        }
        else {
            setValue("displayName", mode === "copy" ? `${copyText} copy` : null);
            setValue("shared", true);
            setValue("editable", true);
        }
    }, [mode]);

    const handleClose = useCallback((data) => {
        if (onClose) onClose(data);
    }, []);

    const onSubmit = async formdata => {
        const url = mode === "edit" ?
            `/api/dashboard/custom/edit/${dashboardId}`
            : mode === "copy" ?
                `/api/dashboard/copy/${dashboardId}`
                : `/api/dashboard/custom/new`;

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
                handleClose({ dashboardId: data.dashboardId });
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
            </MDBox>
        )
    }

    return (
        <MDBox pt={1} px={3} pb={2} minWidth={400}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <MDBox>
                    <MDBox mb={3}>
                        <Textbox setValue={setValue} control={control} fieldDef={{ name: "displayName", displayName: "Name" }} errorMessage={errors["name"] && errors["name"].message} />
                    </MDBox>
                </MDBox>
                <MDBox mb={1}>
                    <Switch setValue={setValue} control={control} fieldDef={{ name: "shared", displayName: "Team can view?" }} errorMessage={errors["shared"] && errors["shared"].message} />
                </MDBox>
                <MDBox mb={3}>
                    <Switch setValue={setValue} control={control} fieldDef={{ name: "editable", displayName: "Team can edit?" }} errorMessage={errors["editable"] && errors["editable"].message} />
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

export default DashboardForm;