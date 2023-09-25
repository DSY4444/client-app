import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Icon, IconButton } from "@mui/material";
import MDButton from "components/MDButton";
import useFullscreen from "hooks/useFullscreen";
import RowMenu from "components/RowMenu";
// import styled from "@emotion/styled";

// const screenSizes = [
//     // { name: "xl", icon: "tv", width: 1400, title: "1200px and up", desc: "Style changes made here will apply at 1201px and up" },
//     // { name: "lg", icon: "desktop_mac", width: 1200, title: "Desktop (Base)", subtitle: "1200px and down", desc: "Style changes made here will apply at 1200px and down" },
//     { name: "lg", icon: "laptop", width: 1200, title: "Laptop", subtitle: "1024px and down", desc: "Style changes made here will apply at 1024px and down" },
//     { name: "md", icon: "tablet_mac", width: 768, title: "Tablet", subtitle: "768px and down", desc: "Style changes made here will apply at 768px and down" },
//     { name: "sm", icon: "phone_iphone", width: 480, title: "Mobile", subtitle: "480px and down", desc: "Style changes made here will apply at 480px and down" },
// ];

// const BreakpointTooltip = styled(({ className, ...props }) => (
//     <Tooltip {...props} componentsProps={{ tooltip: { className: className } }} />
// ))(({ theme }) => ({
//     [`& .${tooltipClasses.arrow}`]: {
//         color: "white!important",
//         "&::before": {
//             backgroundColor: "white!important",
//             border: "1px solid #ddd"
//         }
//     },
//     // [`& .${tooltipClasses.tooltip}`]: {
//     backgroundColor: "white!important",
//     color: 'rgba(0, 0, 0, 0.87)',
//     border: "1px solid #ddd",
//     boxShadow: theme.shadows[1],
//     padding: "8px 12px 12px",
//     textAlign: "justify",
//     // },
// }));

const EditorToolbar = (props) => {
    const {
        title,
        hasWidgets,
        onAddWidgetClick,
        onReportSaveClick,
        onOpenHelp,
        onCloseEditorClick,
        onResetDashboardClick
    } = props;
    const { isFullscreenEnabled, isFullscreen, toggleFullscreen } = useFullscreen();

    const addtionalOptions = [
        {
            label: "Reset Dashboard", onClick: onResetDashboardClick
        }
    ];

    return <MDBox height={54} pl={3} pr={1}
        position="sticky"
        top={0}
        zIndex={9}
        backgroundColor="#56585b!important"
        display="flex"
        alignItems="center"
    >
        <MDBox flex={1} overflow="hidden" display="flex">
            <MDTypography
                component="span"
                fontWeight={"medium"}
                lineHeight={1.2}
                color="white"
                sx={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    width: "90%"
                }}
            >
                {title}
            </MDTypography>
        </MDBox>
        {/* <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "center", flex: 1, mt: .5 }}>
            {
                screenSizes.map(s =>
                    <BreakpointTooltip key={s.name}
                        title={
                            <MDBox key={s.name} width={145} display="flex" flexDirection="column">
                                <MDTypography variant="button" fontWeight="medium" mb={.5}>{s.title}</MDTypography>
                                {s.subtitle && <MDTypography variant="caption" fontWeight="medium" mb={.35}>{s.subtitle}</MDTypography>}
                                <MDTypography variant="caption">{s.desc}</MDTypography>
                            </MDBox>
                        }
                    >
                        <MDBox
                            key={s.name}
                            role="button"
                            onClick={() => onScreenSizeChange(s.name)}
                            sx={({ palette: { login, white, dark, grey } }) => ({
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: s.name === currentBreakpoint ? login.main : "inherit",
                                color: s.name === currentBreakpoint ? dark.main : white.main,
                                height: 36,
                                width: 36,
                                borderRadius: 2,
                                "&:hover": {
                                    backgroundColor: s.name === currentBreakpoint ? login.main : grey[600],
                                },
                                "& .MuiIcon-root": {
                                    fontSize: "18px!important",
                                }
                            })}
                        >
                            <Icon fontSize="small">{s.icon}</Icon>
                        </MDBox>
                    </BreakpointTooltip>
                )
            }
        </Stack> */}
        <MDBox flex={1} display="flex" justifyContent="flex-end" alignItems="center">
            {hasWidgets && <RowMenu iconColor="white" options={addtionalOptions} />}
            <MDButton sx={{ ml: 1.5, px: 2, textTransform: "none", "& .MuiIcon-root": { fontSize: "20px!important" } }} color="info" startIcon={<Icon>add</Icon>} onClick={onAddWidgetClick}>
                Add Widget
            </MDButton>
            <MDButton sx={{ ml: 1.25, px: 2, textTransform: "none", "& .MuiIcon-root": { fontSize: "20px!important" } }} color="login" startIcon={<Icon>save</Icon>} onClick={onReportSaveClick}>
                Done
            </MDButton>
            {
                hasWidgets &&
                <IconButton color="white" onClick={onOpenHelp} sx={{ ml: 1.25 }}>
                    <Icon>help_outline</Icon>
                </IconButton>
            }
            {
                isFullscreenEnabled &&
                <IconButton color="white" onClick={toggleFullscreen} sx={hasWidgets ? {} : { ml: 1.25 }}>
                    <Icon sx={{ fontSize: "20px!important" }} >{isFullscreen ? "close_fullscreen" : "open_in_full"}</Icon>
                </IconButton>
            }
            <IconButton color="white" onClick={onCloseEditorClick}>
                <Icon>close</Icon>
            </IconButton>
        </MDBox>
    </MDBox>
};

export default EditorToolbar;