import { useEffect, useState } from "react";
import { AnimatePresence, motion as m, useAnimation } from "framer-motion";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import AuthLayout from "layouts/AuthLayout";
import logo from "assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Grid, Icon } from "@mui/material";
import { setUserAuthorized, useAppController } from "context";
import fetchRequest from "utils/fetchRequest";
import { setNoRole } from "context";
import { setError } from "context";

function Login() {
  const [, dispatch] = useAppController();
  const controls = useAnimation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ submitting: false, errorMessage: null });
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShow(true)
    }, 200);
  }, [show]);

  const submitLogin = async () => {
    setSubmitStatus(Object.assign({}, { ...submitStatus }, { submitting: true }));
    var [err, authRes] = await fetchRequest.post(`/auth/login/ad`, JSON.stringify(credentials));
    if (err) {
      setSubmitStatus(Object.assign({}, { ...submitStatus }, { submitting: false, errorMessage: 'An error occured while processing the request. Contact your administrator.' }));
    }
    else {
      if (authRes && authRes.result) {
        if (authRes.role === "norole") {
          await fetchRequest.post(`/auth/logout`);
          setNoRole(dispatch);
          setError(dispatch, {
            type: "server",
            status: 403,
            message: "No roles assigned.",
          });
        }
        else {
          controls.start({
            opacity: 0,
            y: 200,
            transition: { duration: 0.2 }
          });
          const [appErr, appRes] = await fetchRequest.get(`/api/app`);
          if (appErr) {
            setError(dispatch, {
              type: appErr.type,
              status: appErr.status,
            });
          }
          else {
            if (typeof (Storage) !== "undefined")
              appRes.defaults?.map((item) => {
                if (!sessionStorage[item.name])
                  return sessionStorage[item.name] = item.value
              })
            const timer = setTimeout(() => {
              navigate("/", { replace: true });
              clearTimeout(timer);
            }, 300);
            setUserAuthorized(dispatch, authRes.data, appRes);
          }
        }
      }
      else if (authRes && authRes.result === false) {
        setSubmitStatus(Object.assign({}, { ...submitStatus }, { submitting: false, errorMessage: authRes.message }));
      }
      else {
        setSubmitStatus(Object.assign({}, { ...submitStatus }, { submitting: false, errorMessage: err.message }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitLogin();
  };

  const handlePassword = (e) => {
    setSubmitStatus(Object.assign({}, { ...submitStatus }, { errorMessage: null }));
    setCredentials(Object.assign({}, { ...credentials }, { password: e.target.value }));
  };

  const handleUsername = (e) => {
    setSubmitStatus(Object.assign({}, { ...submitStatus }, { errorMessage: null }));
    setCredentials(Object.assign({}, { ...credentials }, { userName: e.target.value }));
  };

  const transition = {
    duration: 1,
    ease: [0.43, 0.13, 0.23, 0.96]
  };

  const variants = {
    visible: { height: 300, opacity: 1, transition },
    hidden: { height: 0, opacity: 0, overFlow: 'hidden' },
  }

  return (
    <AuthLayout>
      <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
        <m.div animate={controls}>
          <MDBox
            textAlign="center"
            mt={-12}
          >
            <img src={logo} alt="Ya" style={{ height: 70, overFlow: 'hidden', borderRadius: 8 }} />
          </MDBox>
          <AnimatePresence>
            {show && (
              <m.div
                initial="hidden"
                animate="visible"
                variants={variants}
              // duration={5}
              >

                <MDBox pt={4} pb={3} px={3}>
                  <MDBox
                    p={1}
                    textAlign="center"
                  >
                    <MDTypography variant="h5" fontWeight="medium" mb={1}>
                      Sign in
                    </MDTypography>
                  </MDBox>
                  {
                    submitStatus.errorMessage && (
                      <MDBox textAlign="center" mb={2}>
                        <MDTypography variant="h6" fontWeight="light" color={'error'}>
                          {submitStatus.errorMessage}
                        </MDTypography>
                      </MDBox>
                    )
                  }
                  <form onSubmit={handleSubmit}>
                    <MDBox>
                      <MDBox mb={2}>
                        <MDInput type="email" label="Email" fullWidth onChange={handleUsername} />
                      </MDBox>
                      <MDBox mb={2}>
                        <MDInput type="password" label="Password" fullWidth onChange={handlePassword} />
                      </MDBox>
                      <MDBox mt={4} mb={1}>
                        <MDButton type="submit" disabled={submitStatus.submitting} variant="contained" color="login" fullWidth startIcon={submitStatus.submitting && <CircularProgress size={15} />} endIcon={!submitStatus.submitting && <Icon>trending_flat</Icon>} onClick={handleSubmit}>
                          sign in
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </form>
                </MDBox>
              </m.div>)}
          </AnimatePresence>
        </m.div>
      </Grid>
    </AuthLayout>
  );
}

export default Login;