import MDBox from "components/MDBox";
import { useAppController } from "context";
import { CircularProgress, Icon } from "@mui/material";
import { useEffect, useRef } from "react";
import MDButton from "components/MDButton";
import { toggleHelpSideBar } from "context";

const HelpSidebar = ({ contentBodyRef }) => {
    const [controller, dispatch] = useAppController();
    const { showHelpSideBar, helpCenterUrl, helpCenterToken, helpContextKey } = controller;
    const helpSidebarIframe = useRef();

    // append '/' if not added
    let helpCenterUrlValue = (helpCenterUrl || "");
    helpCenterUrlValue = helpCenterUrlValue.length > 0 && helpCenterUrlValue[helpCenterUrlValue.length - 1] === "/" ? helpCenterUrlValue : helpCenterUrlValue + "/";
    let helpUrl = `${helpCenterUrlValue}?t=${helpCenterToken}`;

    useEffect(() => {
        let helpContextKeyValue1 = (helpContextKey || "");
        if (helpContextKeyValue1.length > 0) {
            helpContextKeyValue1 = helpContextKeyValue1[0] === "/" ? helpContextKeyValue1.substr(1, helpContextKeyValue1.length - 1) : helpContextKeyValue1;
            helpContextKeyValue1 = helpContextKeyValue1.indexOf("#") > -1 ? helpContextKeyValue1.replace("#", `?inAppHelp=true&t=${helpCenterToken}#`) : `${helpContextKeyValue1}?inAppHelp=true&t=${helpCenterToken}`;
        }
        else {
            helpContextKeyValue1 = `?t=${helpCenterToken}`;
        }

        let helpUrl1 = `${helpCenterUrlValue}${helpContextKeyValue1}`;
        if (helpSidebarIframe.current) {
            helpSidebarIframe.current.src = helpUrl1;
        }
    }, [helpContextKey])

    useEffect(() => {
        if (contentBodyRef.current)
            contentBodyRef.current.style.marginRight = showHelpSideBar ? "360px" : "inherit";
    }, [showHelpSideBar])

    const handleToggleHelp = () => {
        toggleHelpSideBar(dispatch, !showHelpSideBar);
    };

    if (!showHelpSideBar)
        return null;

    return <>
        <MDBox
            sx={{
                position: 'fixed',
                top: 70,
                bottom: 0,
                right: 340,
                zIndex: 3
            }}>
            <MDButton
                iconOnly
                color="text"
                sx={({ palette: { white, dark } }) => ({
                    borderRadius: "50%",
                    border: "2px solid #ddd",
                    background: white.main,
                    color: "#979191",
                    "&:hover": {
                        color: dark.main,
                        background: "white!important"
                    }
                })}
                size="medium"
                onClick={handleToggleHelp}
            >
                <Icon>close</Icon>
            </MDButton>
        </MDBox>
        <MDBox
            sx={{
                position: 'fixed',
                top: 56,
                bottom: 0,
                right: 0,
                minWidth: 360,
                maxWidth: 360,
                zIndex: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff!important",
            }}>
            <CircularProgress size={50} color="info" />
        </MDBox>
        <MDBox
            sx={{
                position: 'fixed',
                top: 56,
                bottom: 0,
                right: 0,
                minWidth: 360,
                maxWidth: 360,
                borderLeft: '1px solid #ddd',
                boxShadow: '0rem 0.125rem 0.5625rem -0.3125rem rgb(0 0 0 / 15%)',
                zIndex: 1
            }}>
            {
                helpCenterUrlValue !== "" &&
                <iframe ref={helpSidebarIframe} src={helpUrl} frameBorder={0} height="100%" width="100%">
                </iframe>
            }
        </MDBox>
    </>
};

export default HelpSidebar;