import { CircularProgress, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { getDomain } from "utils";
import MDButton from "components/MDButton";
import Dropdown from "components/YAForm/components/Dropdown";
import Textbox from "components/YAForm/components/Textbox";
import Axios from "axios";
import Switch from "components/YAForm/components/Switch";
import YASkeleton from "components/YASkeleton";
import { YADialogCustomFormContext } from "components/YADialogCustomForm";
import MDTypography from "components/MDTypography";
import { useYADialog } from "components/YADialog";
import Float from "components/YAForm/components/Float";

const BudgetForm = (props) => {
    const { pkId, mode, onClose } = props;
    const [loading, setLoading] = useState(false);
    const domain = getDomain();
    const { showSnackbar } = useYADialog();
    const { onDialogClose } = useContext(YADialogCustomFormContext);


    const { watch, control, setValue, setError, formState: { errors, isSubmitting }, handleSubmit } = useForm({
        // defaultValues: defautValues
    });

    const watchedFields = watch(["enableCpi", "enableLpi"]);
    const watchedFieldsObj = useMemo(() => {
        return {
            enableCpi: watchedFields[0],
            enableLpi: watchedFields[1]
        };
    }, watchedFields)

    async function getFormData() {
        setLoading(true);
        const response = await Axios.get(`${domain}/api/budgets/edit/${pkId}?${("nc=" + Math.random()).replace(".", "")}`);
        setValue("name", response.data["name"]);
        setValue("yearNameId", response.data["yearNameId"]);
        setValue("enableCpi", response.data["enableCpi"] || false);
        setValue("cpi", response.data["cpi"]);
        setValue("enableLpi", response.data["enableLpi"] || false);
        setValue("lpi", response.data["lpi"]);
        setLoading(false);
    }

    useEffect(() => {
        if (mode === "edit") {
            getFormData();
        }
        else {
            setValue("name", null);
            setValue("yearNameId", null);
            setValue("enableCpi", false);
            setValue("cpi", null);
            setValue("enableLpi", false);
            setValue("lpi", null);
        }
    }, [mode]);

    const handleClose = useCallback((budgetId) => {
        if (onClose) onClose(budgetId);
    }, []);

    const onSubmit = async data => {
        const url = mode === "edit" ? `${domain}/api/budgets/${pkId}` : `${domain}/api/budgets/new`;
        const response = await Axios.post(url, data);
        if (response.data && response.data.result === false) {
            if (Array.isArray(response.data.errors) && response.data.errors.length > 0) {
                response.data.errors.forEach((e) => {
                    setError(e.field, { type: "manual", message: e.message });
                });
            }
        }
        else {
            handleClose(response.data?.budgetId);
            onDialogClose();
            showSnackbar(response.data.message, "success");
        }
    };

    const renderContent = () => {
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
                </MDBox>
            )
        }

        return (
            <MDBox pt={1} px={3} pb={2} width={475}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate={true}>
                    <MDBox role="form">
                        <MDBox mb={3}>
                            <Textbox watch={watch} setValue={setValue} control={control} fieldDef={{ name: "name", displayName: "Budget Name", required: true }} errorMessage={errors["name"] && errors["name"].message} />
                        </MDBox>
                        <MDBox mb={5}>
                            <Dropdown watch={watch} setValue={setValue} control={control} fieldDef={{ name: "yearNameId", displayName: "Year", required: true, dataSource: { type: "custom", url: "/api/budgets/lookup/year" } }} errorMessage={errors["yearNameId"] && errors["yearNameId"].message} />
                        </MDBox>
                        <MDBox mt={2} mb={2}>
                            <MDTypography variant="button" fontWeight="medium">Manage Variables</MDTypography>
                        </MDBox>
                        <MDBox display="flex" flexDirection="row">
                            <MDBox mb={3}>
                                <Switch watch={watch} setValue={setValue} control={control} fieldDef={{ name: "enableCpi", displayName: "Enable CPI", dependentFields: ["cpi"] }} errorMessage={errors["enableCpi"] && errors["enableCpi"].message} />
                            </MDBox>
                            <MDBox mb={3} ml={4} flex={1}>
                                <Float disabled={!watchedFieldsObj.enableCpi} watch={watch} setValue={setValue} control={control} fieldDef={{ name: "cpi", displayName: "", variant: "outlined", width: 100, placeholder: "0", suffixText: "%" }} errorMessage={errors["cpi"] && errors["cpi"].message} />
                            </MDBox>
                        </MDBox>
                        <MDBox display="flex" flexDirection="row">
                            <MDBox mb={2}>
                                <Switch watch={watch} setValue={setValue} control={control} fieldDef={{ name: "enableLpi", displayName: "Enable LPI", dependentFields: ["lpi"] }} errorMessage={errors["enableLpi"] && errors["enableLpi"].message} />
                            </MDBox>
                            <MDBox mb={2} ml={4} flex={1}>
                                <Float disabled={!watchedFieldsObj.enableLpi} watch={watch} setValue={setValue} control={control} fieldDef={{ name: "lpi", displayName: "", variant: "outlined", width: 100, placeholder: "0", suffixText: "%" }} errorMessage={errors["lpi"] && errors["lpi"].message} />
                            </MDBox>
                        </MDBox>
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

export default BudgetForm;