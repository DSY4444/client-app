import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { parseJsonString } from "utils";

const AlertNotificationDetails = (props) => {
    const { headerDetails } = props;
    const channelConfig = parseJsonString(headerDetails["alertNotification.channelConfig"]);
    return (
        <MDBox display="flex" mt={.5} flexDirection="column">
            <MDTypography component="span" variant="button" fontWeight={"medium"} lineHeight={1.75}>Notification details</MDTypography>
            <MDBox display="flex" flexDirection="column" mt={3}>
                <MDTypography component="span" variant="caption" fontWeight={"medium"} lineHeight={1.75}>Alert name</MDTypography>
                <MDTypography component="span" variant="button">{headerDetails.name}</MDTypography>
            </MDBox>
            <MDBox display="flex" flexDirection="column" mt={2}>
                <MDTypography component="span" variant="caption" fontWeight={"medium"} lineHeight={1.75}>Channel Name</MDTypography>
                <MDTypography component="span" variant="button">{headerDetails["alertNotification.notificationChannel.name"]}</MDTypography>
            </MDBox>
            <MDBox display="flex" flexDirection="column" mt={2}>
                <MDTypography component="span" variant="caption" fontWeight={"medium"} lineHeight={1.75}>Channel Description</MDTypography>
                <MDTypography component="span" variant="button">{headerDetails["alertNotification.notificationChannel.desc"]}</MDTypography>
            </MDBox>
            <MDBox display="flex" flexDirection="column" mt={2}>
                <MDTypography component="span" variant="caption" fontWeight={"medium"} lineHeight={1.75}>Channel Type</MDTypography>
                <MDTypography component="span" variant="button">{headerDetails["alertNotification.notificationChannel.type"]}</MDTypography>
            </MDBox>
            <MDBox display="flex" flexDirection="column" mt={2}>
                <MDTypography component="span" variant="caption" fontWeight={"medium"} lineHeight={1.75}>Channel Message Template</MDTypography>
                <MDBox bgColor="#faf7f7" mt={1} p={1.5} borderRadius="8px">
                    <MDTypography component="p" variant="button" whiteSpace="pre-line">
                        {channelConfig.channelMessage}
                    </MDTypography>
                </MDBox>
            </MDBox>
        </MDBox>
    )
};

export default AlertNotificationDetails;