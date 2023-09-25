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

const DataWorkspaceForm = (props) => {
    const { workspaceId, mode, onClose } = props;
    const [loading, setLoading] = useState(false);
    const { showSnackbar, showAlert } = useYADialog();
    const { onDialogClose } = useContext(YADialogCustomFormContext);

    const { control, watch, setValue, setError, formState: { errors, isSubmitting }, handleSubmit } = useForm();

    async function getFormData() {
        setLoading(true);
        const [error, data] = await fetchRequest.get(`/api/dataWorkspaces/custom/${workspaceId}`);
        if (error)
            console.error(error);
        setValue("name", data["name"]);
        setValue("description", data["description"]);
        setValue("type", data["type"]);
        setValue("shared", data["shared"] || false);
        setLoading(false);
    }

    useEffect(() => {
        if (mode === "edit") {
            getFormData();
        }
        else {
            setValue("name", null);
            setValue("description", null);
            setValue("type", null);
            setValue("shared", true);
        }
    }, [mode]);

    const handleClose = useCallback((data) => {
        if (onClose) onClose(data);
    }, []);

    const onSubmit = async formdata => {
        const url = mode === "edit" ?
            `/api/dataWorkspaces/custom/edit/${workspaceId}`
            : `/api/dataWorkspaces/custom/new`;

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
                handleClose(data.workspaceId);
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
            </MDBox>
        )
    }

    return (
        <MDBox px={3} pb={2} minWidth={400}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <MDBox mb={2}>
                    <Textbox setValue={setValue} control={control} fieldDef={{ name: "name", displayName: "Name", required: true }} errorMessage={errors["name"] && errors["name"].message} />
                </MDBox>
                <MDBox mb={2}>
                    <Textbox setValue={setValue} control={control} fieldDef={{ name: "description", displayName: "Description" }} errorMessage={errors["description"] && errors["description"].message} />
                </MDBox>
                <MDBox mb={2}>
                    <Dropdown watch={watch} setValue={setValue} control={control} fieldDef={{ name: "type", displayName: "Type", required: true, dataSource: { type: "static", data: [{ value: "expenditure", label: "Actual Spend" }, { value: "expenditureYearly", label: "Actual Spend (Yearly)" }] } }} errorMessage={errors["type"] && errors["type"].message} />
                </MDBox>
                <MDBox mb={1}>
                    <Switch setValue={setValue} control={control} fieldDef={{ name: "shared", displayName: "Team can view?" }} errorMessage={errors["shared"] && errors["shared"].message} />
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

export default DataWorkspaceForm;