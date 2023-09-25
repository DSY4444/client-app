import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion as m } from "framer-motion";
import { ClickAwayListener, Icon } from "@mui/material";
import MDAvatar from "components/MDAvatar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import NotificationItem from "components/NotificationItem";
import { useYADialog } from "components/YADialog";
import { useAppController } from "context";

const USER_ROLES = {
    "admin": "Admin",
    "powerUser": "Power User",
    "viewer": "Viewer",
    "budgetProcessOwner": "Budget Process Owner",
    "budgetContributor": "Budget Contributor",
}

const UserInfoDrawer = props => {
    const navigate = useNavigate()
    const { showPrompt } = useYADialog();
    const [controller] = useAppController();
    const { userInfo } = controller;

    const handleClose = useCallback(() => {
        if (props.onClose)
            props.onClose();
    }, []);

    const logout = async () => {
        handleClose()
        navigate("/logout", { replace: true });
    }

    const handleLogout = () => {
        showPrompt("Sign out", "Are you sure you want to sign out?", () => logout());
    }

    const avatarAnimation = {
        visible: { y: 0, x: 0 },
        hidden: { y: -50, x: 50 },
    }

    return <ClickAwayListener onClickAway={handleClose}>
        <MDBox height="100vh">
            <Icon
                sx={() => ({
                    cursor: "pointer",
                    position: "absolute",
                    right: 16,
                    top: 16
                })}
                onClick={handleClose}
            >
                close
            </Icon>
            <MDBox borderBottom="1px solid rgba(0, 0, 0, 0.125)" minHeight={250} display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
                <m.div
                    initial="hidden"
                    animate="visible"
                    variants={avatarAnimation}
                >
                    <MDAvatar name={userInfo?.displayName} size="xl" sx={{ mb: 1 }} shadow="xl" />
                </m.div>
                <MDTypography variant="subtitle1" color="dark" fontWeight="light">{userInfo?.displayName}</MDTypography>
                <MDTypography variant="button" color="text" fontWeight="medium">{USER_ROLES[userInfo?.role]}</MDTypography>
            </MDBox>
            <MDBox component="ul" p={2} mt={5}>
                <NotificationItem icon={<Icon>logout</Icon>} title="Sign out" onClick={handleLogout} />
            </MDBox>
        </MDBox>
    </ClickAwayListener>
}

export default UserInfoDrawer;