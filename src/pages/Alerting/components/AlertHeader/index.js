import MDBadge from "components/MDBadge";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import moment from "moment";
import { formatAlertMetricValue } from "utils";
import { parseCronExpression } from "utils";

const AlertHeader = (props) => {
    const { headerDetails } = props;

    let triggersOnDescription = ''
    if (headerDetails.type === "SCHEDULE") {
        if (headerDetails.triggerCronExpression)
            triggersOnDescription = parseCronExpression(headerDetails.triggerCronExpression);
    }
    else {
        triggersOnDescription = `On ${headerDetails.triggerEvent} event`;
    }

    let triggerConditionDescription = ''
    if (headerDetails.triggerConditionType === "THRESHOLD") {
        if (headerDetails.thresholdPosition === "ABOVE_THRESHOLD")
            triggerConditionDescription = `Metric value is above ${formatAlertMetricValue(headerDetails.thresholdValue, headerDetails["metric.type"])}`
        else
            triggerConditionDescription = `Metric value is below ${formatAlertMetricValue(headerDetails.thresholdValue, headerDetails["metric.type"])}`
    }
    else {
        triggerConditionDescription = `Metric value is null or empty`;
    }

    return (
        <MDBox display="flex" mt={.5} bgColor="#faf7f7" px={2} py={1.5} borderRadius="4px">
            <MDBox display="flex" flexDirection="column">
                <MDTypography component="span" variant="caption" fontWeight={"medium"} lineHeight={1.75}>Triggers On</MDTypography>
                <MDTypography component="span" variant="button">{triggersOnDescription}</MDTypography>
            </MDBox>
            <MDBox display="flex" flexDirection="column" ml={4} pl={2} borderLeft="1px solid #d9d5d5">
                <MDTypography component="span" variant="caption" fontWeight={"medium"} lineHeight={1.75}>Trigger Condition</MDTypography>
                <MDTypography component="span" variant="button">{triggerConditionDescription}</MDTypography>
            </MDBox>
            <MDBox display="flex" flexDirection="column" ml={4} pl={2} borderLeft="1px solid #d9d5d5">
                <MDTypography component="span" variant="caption" fontWeight={"medium"} lineHeight={1.75}>Metric Name</MDTypography>
                <MDTypography component="span" variant="button">{headerDetails["metric.name"]}</MDTypography>
            </MDBox>
            {
                headerDetails.lastRunAt && (
                    <MDBox display="flex" flexDirection="column" ml={4} pl={2} borderLeft="1px solid #d9d5d5">
                        <MDTypography component="span" variant="caption" fontWeight={"medium"} lineHeight={1.75}>Last Run</MDTypography>
                        <MDTypography component="span" variant="button">{moment(headerDetails.lastRunAt).fromNow()}</MDTypography>
                    </MDBox>
                )
            }
            {
                headerDetails.lastRunStatus && (
                    <MDBox display="flex" flexDirection="column" ml={4} pl={2} borderLeft="1px solid #d9d5d5">
                        <MDTypography component="span" variant="caption" fontWeight={"medium"} lineHeight={1.75}>Last Run Status</MDTypography>
                        <MDBadge container badgeContent={headerDetails.lastRunStatus} color={headerDetails.lastRunStatus.toLowerCase()} variant="gradient" size="xs" />
                    </MDBox>
                )
            }
        </MDBox>
    )
};

export default AlertHeader;