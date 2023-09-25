import { useEffect } from "react";
import { motion as m } from "framer-motion";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import AuthLayout from "layouts/AuthLayout";
import logo from "assets/images/logo.png";
import { useAppController, setLogoutUser } from "context";
import fetchRequest from "utils/fetchRequest";

export const LogoutBox = () => {
  const animate = {
    visible: { y: 0, transition: { duration: 0.2 } },
    hidden: { y: 50 },
  };

  return (
    <AuthLayout>
      <m.div
        initial="hidden"
        animate="visible"
        variants={animate}
      >
        <MDBox width={500} p={2}>
          <MDBox textAlign="center" mt={-12}>
            <img src={logo} alt="Ya" style={{ height: 70, overFlow: 'hidden', borderRadius: 8 }} />
          </MDBox>
          <MDBox pt={3} textAlign="center">
            <MDTypography variant="h5" fontWeight="medium" mb={1}>
              You signed out of your account
            </MDTypography>
            <MDTypography variant="body2">
              It&apos;s a good idea to close all browser windows.
            </MDTypography>
          </MDBox>
        </MDBox>
      </m.div>
    </AuthLayout>
  );
};

const Logout = () => {
  const [controller, dispatch] = useAppController();
  useEffect(async () => {
    if (!controller.loggedOut) {
      await fetchRequest.post(`/auth/logout`);
      setLogoutUser(dispatch);
    }
  }, [dispatch]);

  return null;
}

export default Logout;