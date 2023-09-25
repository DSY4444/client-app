import { CircularProgress, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import MDButton from "components/MDButton";
import Textbox from "components/YAForm/components/Textbox";
import { YADialogCustomFormContext } from "components/YADialogCustomForm";
import { useYADialog } from "components/YADialog";
import fetchRequest from "utils/fetchRequest";
// import Switch from "components/YAForm/components/Switch";
import YASkeleton from "components/YASkeleton";
import MDTypography from "components/MDTypography";
import Dropdown from "components/YAForm/components/Dropdown";
import { parseJsonString } from "utils";

const AlertForm = (props) => {
    const { alertId, mode, onClose } = props;
    const [loading, setLoading] = useState(false);
    const { showSnackbar, showAlert } = useYADialog();
    const { onDialogClose } = useContext(YADialogCustomFormContext);

    const { watch, control, setValue, setError, formState: { errors, isSubmitting }, handleSubmit } = useForm();

    const watchedFields = watch(["metricId", "type", "triggerConditionType"]);
    const watchedFieldsObj = useMemo(() => {
        return {
            metricId: watchedFields[0],
            type: watchedFields[1],
            triggerConditionType: watchedFields[2]
        };
    }, watchedFields)

    async function getFormData() {
        setLoading(true);
        const [error, data] = await fetchRequest.get(`/api/alert/${alertId}`);
        if (error)
            console.error(error);
        setValue("name", data["name"]);
        setValue("desc", data["desc"]);
        setValue("metricId", data["metricId"]);
        setValue("type", data["type"]);
        setValue("triggerEvent", data["triggerEvent"]);
        setValue("triggerCronExpression", data["triggerCronExpression"]);
        setValue("triggerConditionType", data["triggerConditionType"]);
        setValue("thresholdPosition", data["thresholdPosition"]);
        setValue("thresholdValue", data["thresholdValue"]);
        setValue("notificationChannelId", data["alertNotification.notificationChannelId"]);
        const channelConfig = parseJsonString(data["alertNotification.channelConfig"]);
        setValue("channelMessage", channelConfig?.channelMessage);
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
            `/api/alert/${alertId}`
            : `/api/alert/new`;

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
                handleClose({ notificationChannelId: data.notificationChannelId });
                onDialogClose();
                showSnackbar(data.message, "success");
            }
        }
        else {
            showAlert("Create Alert", error?.data?.message || "Something went wrong. Contact your administrator.");
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
                <MDBox mb={2}>
                    <Textbox watch={watch} setValue={setValue} control={control} fieldDef={{ name: "name", displayName: "Alert name", required: true }} errorMessage={errors["name"] && errors["name"].message} />
                </MDBox>
                <MDBox mb={2}>
                    <Textbox watch={watch} setValue={setValue} control={control} fieldDef={{ name: "desc", displayName: "Description" }} errorMessage={errors["desc"] && errors["desc"].message} />
                </MDBox>
                <MDBox mt={6} mb={2}>
                    <MDTypography variant="button" fontWeight="medium">Select a metric</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                    <Dropdown watch={watch} setValue={setValue} control={control} fieldDef={{ name: "metricId", displayName: "Metric", required: true, dataSource: { type: "custom", url: "/api/alert/lookup/metric" } }} errorMessage={errors["metricId"] && errors["metricId"].message} />
                </MDBox>
                <MDBox mt={6} mb={2}>
                    <MDTypography variant="button" fontWeight="medium">Configure trigger</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                    <Dropdown watch={watch} setValue={setValue} control={control} fieldDef={{ name: "type", displayName: "Trigger type", required: true, dataSource: { type: "static", data: [{ value: "SCHEDULE", label: "Scheduled trigger" }, { value: "EVENT", label: "Application event trigger" }] } }} errorMessage={errors["type"] && errors["type"].message} />
                </MDBox>
                {
                    watchedFieldsObj["type"] && watchedFieldsObj["type"] === "SCHEDULE" && (
                        <MDBox mb={2}>
                            <Textbox watch={watch} setValue={setValue} control={control} fieldDef={{ name: "triggerCronExpression", displayName: "Cron expression", required: true }} errorMessage={errors["triggerCronExpression"] && errors["triggerCronExpression"].message} />
                        </MDBox>
                    )
                }
                {
                    watchedFieldsObj["type"] && watchedFieldsObj["type"] === "EVENT" && (
                        <MDBox mb={2}>
                            <Dropdown watch={watch} setValue={setValue} control={control} fieldDef={{ name: "triggerEvent", displayName: "Application Event", required: true, dataSource: { type: "custom", url: "/api/alert/lookup/event" } }} errorMessage={errors["triggerEvent"] && errors["triggerEvent"].message} />
                        </MDBox>
                    )
                }
                <MDBox mt={6} mb={2}>
                    <MDTypography variant="button" fontWeight="medium">Configure trigger condition</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                    <Dropdown watch={watch} setValue={setValue} control={control} fieldDef={{ name: "triggerConditionType", displayName: "Condition type", required: true, dataSource: { type: "static", data: [{ value: "ABSENCE_OF_VALUE", label: "Absence of value" }, { value: "THRESHOLD", label: "Threshold" }] } }} errorMessage={errors["triggerConditionType"] && errors["triggerConditionType"].message} />
                </MDBox>
                {
                    watchedFieldsObj["triggerConditionType"] && watchedFieldsObj["triggerConditionType"] === "THRESHOLD" && (
                        <>
                            <MDBox mb={2}>
                                <Dropdown watch={watch} setValue={setValue} control={control} fieldDef={{ name: "thresholdPosition", displayName: "Threshold Position", required: true, dataSource: { type: "static", data: [{ value: "ABOVE_THRESHOLD", label: "Above threshold" }, { value: "BELOW_THRESHOLD", label: "Below threshold" }] } }} errorMessage={errors["thresholdPosition"] && errors["thresholdPosition"].message} />
                            </MDBox>
                            <MDBox mb={2}>
                                <Textbox watch={watch} setValue={setValue} control={control} fieldDef={{ name: "thresholdValue", displayName: "Threshold Value", required: true }} errorMessage={errors["thresholdValue"] && errors["thresholdValue"].message} />
                            </MDBox>
                        </>
                    )
                }
                <MDBox mt={6} mb={2}>
                    <MDTypography variant="button" fontWeight="medium">Configure notification</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                    <Dropdown watch={watch} setValue={setValue} control={control} fieldDef={{ name: "notificationChannelId", displayName: "Notification channel", required: true, dataSource: { type: "custom", url: "/api/alert/lookup/notificationChannel" } }} errorMessage={errors["notificationChannelId"] && errors["notificationChannelId"].message} />
                </MDBox>
                <MDBox mb={2}>
                    <Textbox textarea rows={4} watch={watch} setValue={setValue} control={control} fieldDef={{ name: "channelMessage", displayName: "Channel message", required: true }} errorMessage={errors["channelMessage"] && errors["channelMessage"].message} />
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

export default AlertForm;