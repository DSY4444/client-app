import { Icon, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import YAScrollbar from "components/YAScrollbar";
import { initWorkspace } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { useDataWorkspaceContext } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { useCallback } from "react";

const preRequisites = [
    { desc: "Only .xls, .xlsx or .csv files are supported." },
    { desc: "Max file size must be 2MB." },
    { desc: "Delete unnecessary sheets, rows and columns to reduce file size." },
    { desc: "Empty rows will be ignored if not deleted." },
    { desc: "To speed up the ingestion process, download the predefined upload template file and fill in your data." },
];

const wizSteps = [
    { id: 1, title: "Upload your file", desc: "Aut perferendis consectetur nam alias quod et quidem dolores." },
    { id: 2, title: "Map fields", desc: "Aut perferendis consectetur nam alias quod et quidem dolores." },
    { id: 3, title: "Validate & clean data", desc: "Aut perferendis consectetur nam alias quod et quidem dolores." },
    // { id: 4, title: "Finish", desc: "Eum cumque illum vel repellat laborum qui obcaecati." },
]

const homeStepStyles = ({ palette: { text }, typography: { size } }) => {
    return {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        pl: 2,
        pr: 8,
        py: 1,
        "& .MuiListItem-root": {
            my: 1.25
        },
        "& .MuiListItemIcon-root": {
            minWidth: 30,
            maxWidth: 30,
            height: 30,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0efef",
            mr: 2
        },
        "& .MuiListItemText-primary": {
            fontSize: size.xs,
        },
        "& .MuiListItemText-secondary": {
            fontSize: size.sm,
            color: text.main,
        },
    }
}

const HomeStep = () => {
    const [state, dispatch] = useDataWorkspaceContext();
    const { initiated } = state;

    const handleOnGetStartedClick = useCallback(() => {
        initWorkspace(dispatch);
    }, []);

    return (
        <MDBox flex={1}>
            <MDBox display="flex" flexDirection="row" alignItems="flex-start" justifyContent="space-between" px={2} py={3}>
                <MDTypography variant="subtitle1" fontWeight="medium" component="span" textAlign="center">
                    Welcome to your data ingestion workspace
                </MDTypography>
            </MDBox>
            <MDBox flex={1} display="flex" sx={{ overflow: "hidden" }}>
                <YAScrollbar>
                    <MDBox sx={theme => homeStepStyles(theme)}>
                        <MDBox flex={1} width="100%">
                            <MDBox p={1} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center" borderBottom="1px solid #ddd">
                                <MDTypography variant="button" fontWeight="medium" component="span" textAlign="center">
                                    Pre-requisites / Checklist
                                </MDTypography>
                                {/* <MDTypography variant="button" color="text">
                                    Verify the following information to ease the ingestion process.
                                </MDTypography> */}
                            </MDBox>
                            <MDBox px={1} py={1.5}>
                                <List>
                                    {
                                        preRequisites.map((r, ri) => (
                                            <ListItem key={ri}>
                                                <MDTypography variant="button">
                                                    {`- ${r.desc}`}
                                                </MDTypography>
                                            </ListItem>
                                        ))
                                    }
                                </List>
                            </MDBox>
                        </MDBox>
                        <MDBox flex={1} width="100%" mt={1}>
                            <MDBox p={1} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center" borderBottom="1px solid #ddd">
                                <MDTypography variant="button" fontWeight="medium" component="span" textAlign="center">
                                    Overview
                                </MDTypography>
                                {/* <MDTypography variant="button" color="text">
                            Overview of the wizard steps
                        </MDTypography> */}
                            </MDBox>
                            <MDBox px={1} py={1.5}>
                                <List>
                                    {
                                        wizSteps.map((r, ri) => (
                                            <ListItem key={ri} disableTypography={true}>
                                                <ListItemIcon>
                                                    <MDTypography variant="caption" fontWeight="medium" color="dark">{`${r.id}`}</MDTypography>
                                                </ListItemIcon>
                                                <ListItemText primary={r.title} secondary={r.desc}></ListItemText>
                                            </ListItem>
                                        ))
                                    }
                                </List>
                            </MDBox>
                        </MDBox>
                        {
                            !initiated &&
                            <MDBox flex={1} width="100%" py={4} display="flex" justifyContent="center">
                                <MDButton
                                    size="medium"
                                    color="info"
                                    endIcon={<Icon>arrow_forward_ios</Icon>}
                                    onClick={handleOnGetStartedClick}
                                >
                                    {"Let's get started"}
                                </MDButton>
                            </MDBox>
                        }
                    </MDBox>
                </YAScrollbar>
            </MDBox>
        </MDBox>
    )
};

export default HomeStep;