// @mui material components
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { boxShadows, transitions } = theme;
  const { openDrawer, topPadded, width, anchor } = ownerState;

  const { lg } = boxShadows;

  const getTransitionStyle = () => {
    if (anchor === "left") {
      return {
        right: "initial",
        left: 0,
        transition: transitions.create("left", {
          easing: transitions.easing.sharp,
          duration: transitions.duration.short,
        })
      }
    }
    else return {
      left: "initial",
      right: 0,
      transition: transitions.create("right", {
        easing: transitions.easing.sharp,
        duration: transitions.duration.short,
      })
    }
  };

  // drawer styles when openDrawer={true}
  const drawerOpenStyles = () => ({
    width: width || 360,
    ...(getTransitionStyle())
  });

  // drawer styles when openDrawer={false}
  const drawerCloseStyles = () => ({
    transition: transitions.create("all", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.short,
    }),
  });

  return {
    "& .MuiDrawer-paper": {
      height: topPadded ? "calc(100vh - 56px)" : "100%",
      top: topPadded ? 57 : 0,
      margin: 0,
      // padding: `0 ${pxToRem(10)}`,
      borderRadius: 0,
      boxShadow: lg,
      overflowY: "auto",
      ...(openDrawer ? drawerOpenStyles() : drawerCloseStyles()),
    },
  };
});
