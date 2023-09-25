import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Icon, Card } from "@mui/material";
import { useEffect, useState } from "react";
import MDButton from 'components/MDButton';
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import { useYADialog } from 'components/YADialog';

const buildColumns = () => {
    return [
        {
            "Header": "Cube Name",
            "accessor": "cube",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value}
                </MDTypography>
            }
        },
        {
            "Header": "Last Refreshed",
            "accessor": "lastRefreshed",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value}
                </MDTypography>
            }
        },
        {
            "Header": "Action",
            "disableSorting": true,
            "accessor": "actions",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value}
                </MDTypography>
            }
        }
    ]
}

const buildRows = (data, setRefresh, showSnackbar) => {

    const onRefresh = async (cubeKey) => {
        let cubeVal = cubeKey.charAt(0).toLowerCase() + cubeKey.slice(1);
        var [err, data] = await fetchRequest.post(`/api/dataflow/cubeRefreshKey/${cubeVal}`);
        if (err) {
            console.err(err)
        }
        else {
         setRefresh(Math.random());
         showSnackbar(data, "success")
         }
        }


    const rows = [];
    if (Array.isArray(data) && data.length > 0) {
        data.forEach((r) => {
            let row = {};
            Object.keys(r).forEach((k) => {
                row[k.replace(/\./g, "__")] = r[k]
            });
            row["actions"] = (
                <MDBox display="flex"  alignItems="center" mt={{ xs: 2, sm: 0 }}>
                    <MDTypography display="flex" alignItems="center" component="a" href="#" onClick={() => onRefresh(r["cube"])} variant="caption" color="text" fontWeight="medium">
                        <Icon fontSize="small" >refresh</Icon>&nbsp;Refresh
                    </MDTypography>
                </MDBox>
            )
            rows.push(row);
        });
    }
    return rows;
}

const CubeRefreshKey = () => {
    const { showSnackbar } = useYADialog();
    const [refresh, setRefresh] = useState(null);
    const handleError = useHandleError();
    const [rows, setRows] = useState([]);
    const columns = buildColumns();

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/dataflow/getCubeRefreshKey`);
            if (err) {
                handleError(err);
            }
            else {
                data = data.filter((obj) => {
                    return obj.cube !== "All";
                });
                setRows(buildRows(data, setRefresh, showSnackbar));
            }
        }
        getList();
    }, [refresh]);


    const onRefreshAll = async (cubeKey) => {
        let cubeVal = cubeKey.charAt(0).toLowerCase() + cubeKey.slice(1);
        var [err, data] = await fetchRequest.post(`/api/dataflow/cubeRefreshKey/${cubeVal}`);
        if (err) {
            console.err(err)
        }
        else {
             setRefresh(Math.random());
            showSnackbar(data, "success")
              }
             }

    return (
        <>
            <MDBox color="text" pt={0} mt={0} display="flex" flexDirection="row" justifyContent="space-between">
                <PageHeader title="Cube Refresh" subtitle="Manually refresh cubes on adhoc basis" />
                <MDBox mt={2.5} mr={3} pt={0} >
                    <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => onRefreshAll("all")}
                    >
                        Refresh All
                    </MDButton>
                </MDBox>
            </MDBox>
            <MDBox p={3} pt={1}>
                <Card sx={{ height: "100%" }} px={0}>
                    <DataTable
                        table={{ columns, rows }}
                        showTotalEntries={true}
                        isSorted={true}
                        newStyle1={true}
                        noEndBorder
                        entriesPerPage={true}
                        canSearch={true}
                    />
                </Card>
            </MDBox>

        </>
    );
};

export default AnimatedRoute(CubeRefreshKey);



