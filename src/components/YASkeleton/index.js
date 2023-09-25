import { Skeleton } from "@mui/material";
import MDBox from "components/MDBox";
import PageHeader from "components/PageHeader";

const YASkeleton = ({variant}) => {
  if(variant === "filter-item")
    return <Skeleton animation="wave"  height={68} />
  else if(variant === "dropdown")
  return <Skeleton animation="wave" height={50} />
  else if(variant === "title")
    return <Skeleton animation="wave"  width={200} />
  else if(variant === "breadcrumb")
    return <Skeleton animation="wave"  width={80} height={20} />
  else if(variant === "subtitle")
    return <Skeleton animation="wave"  width={150} />
  else  if(variant === "dashboard-item")
    return <Skeleton variant="rectangular" animation="wave" height="100%" width="100%" sx={({borders: {borderRadius}}) => ({ borderRadius: borderRadius.md })}/>
  else  if(variant === "chart")
    return <MDBox display="flex" alignItems="flex-end">
      <Skeleton variant="rectangular" animation="wave" height="40px" width="15px" sx={({borders: {borderRadius}}) => ({ borderRadius: borderRadius.sm })}/>
      <Skeleton variant="rectangular" animation="wave" height="60px" width="15px" sx={({borders: {borderRadius}}) => ({ borderRadius: borderRadius.sm, mx: .5 })}/>
      <Skeleton variant="rectangular" animation="wave" height="30px" width="15px" sx={({borders: {borderRadius}}) => ({ borderRadius: borderRadius.sm })}/>
    </MDBox>
  else  if(variant === "dashboard-loading")
    return <>
      <PageHeader loading/>
      <MDBox display="flex" alignItems="center" justifyContent="center" sx={{width: "100wh", marginTop: "30vh"}}>
        <MDBox display="flex" flexDirection="column">
          <MDBox width="100px" display="flex">
            <Skeleton variant="rectangular" animation="wave" height="10px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
            <Skeleton variant="rectangular" animation="wave" height="10px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3 })}/>
            <Skeleton variant="rectangular" animation="wave" height="10px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
          </MDBox>
          <MDBox width="100px" display="flex" flexWrap="wrap">
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3 })}/>
          </MDBox>
          <MDBox width="100px" display="flex" flexWrap="wrap">
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
          </MDBox>
        </MDBox>
      </MDBox>
    </>
  else  if(variant === "dataflow-loading")
    return <>
      <MDBox display="flex" alignItems="center" justifyContent="center" sx={{width: "100wh", marginTop: "30vh"}}>
        <MDBox display="flex" flexDirection="column">
          <MDBox width="100px" display="flex">
            <Skeleton variant="rectangular" animation="wave" height="10px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
            <Skeleton variant="rectangular" animation="wave" height="10px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3 })}/>
            <Skeleton variant="rectangular" animation="wave" height="10px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
          </MDBox>
          <MDBox width="100px" display="flex" flexWrap="wrap">
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3 })}/>
          </MDBox>
          <MDBox width="100px" display="flex" flexWrap="wrap">
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
          </MDBox>
        </MDBox>
      </MDBox>
    </>
  else  if(variant === "loading")
    return <>
      <MDBox display="flex" alignItems="center" justifyContent="center" sx={{position: "absolute", inset: 0}}>
        <MDBox display="flex" flexDirection="column">
          <MDBox width="100px" display="flex">
            <Skeleton variant="rectangular" animation="wave" height="10px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
            <Skeleton variant="rectangular" animation="wave" height="10px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3 })}/>
            <Skeleton variant="rectangular" animation="wave" height="10px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
          </MDBox>
          <MDBox width="100px" display="flex" flexWrap="wrap">
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3 })}/>
          </MDBox>
          <MDBox width="100px" display="flex" flexWrap="wrap">
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
            <Skeleton variant="rectangular" animation="wave" height="40px" sx={({borders: {borderRadius}}) => ({ flex: 1, borderRadius: borderRadius.sm, m: .3  })}/>
          </MDBox>
        </MDBox>
      </MDBox>
  </>

  return <Skeleton animation="wave" />
}

export default YASkeleton;