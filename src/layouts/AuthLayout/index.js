import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import { motion as m} from "framer-motion";

const variants = {
  visible: { opacity: 1, transition: {duration: 2}},
  hidden: { opacity: 0},
}

function AuthLayout({ image, children }) {

  return (
    <MDBox
      width="100vw"
      height="100%"
      minHeight="100vh"
      bgColor={'white'}
      sx={{ overflowX: "hidden" }}
    >
        <MDBox
        position="absolute"
        width="100%"
        minHeight="100vh"
        sx={{
          backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
            image &&
            `${linearGradient(
              rgba(gradients.dark.main, 0.6),
              rgba(gradients.dark.state, 0.6)
            )}, url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
       <MDBox px={1} width="100%" height="100vh" mx="auto" display="flex" justifyContent="center" alignItems="center" >
            {children}
      </MDBox>
      <m.div initial={'hidden'} animate={'visible'} variants={variants} duration={3}>
        {/* <Footer absolute /> */}
      </m.div>
    </MDBox>
  );
}

// Setting default values for the props for AuthLayout
AuthLayout.defaultProps = {
  background: "default",
};

// Typechecking props for the AuthLayout
AuthLayout.propTypes = {
  background: PropTypes.oneOf(["white", "light", "default"]),
  children: PropTypes.node.isRequired,
};

export default AuthLayout;