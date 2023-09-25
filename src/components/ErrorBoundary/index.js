import { Component } from "react";
import MDBox from "components/MDBox";
import ErrorBox from "components/ErrorBox";
import EmptyState from "components/EmptyState";
import logo from "assets/images/logo.png";
import error_img from "assets/svg/error.svg";
import { Icon } from "@mui/material";
import MDButton from "components/MDButton";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  hideLoadingScreen = () => {
    document.getElementById("loadingScreen")?.remove();
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
    console.error("error:", error, errorInfo);
    if (this.props.root)
      this.hideLoadingScreen();
  }

  render() {
    if (this.state.hasError) {
      if (this.props.root)
        return <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
          <img src={logo} alt="Ya" style={{ height: 70, overFlow: 'hidden', borderRadius: 8 }} />
          <EmptyState
            variant="error"
            size="large"
            hideIcon
            title="Error!"
            description="An error occured while processing your request. Contact your administrator for more details."
            actions={(
              <MDButton variant="gradient" color="info" startIcon={<Icon>refresh</Icon>} onClick={() => window.location.reload()}>
                Refresh
              </MDButton>
            )}
          />
        </MDBox>
      else if (this.props.page)
        return <MDBox display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 150px)">
          <EmptyState
            variant="error"
            size="large"
            image={error_img}
            title="Error!"
            description="An error occured while processing your request. Contact your administrator for more details."
          />
        </MDBox>
      return <ErrorBox />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;