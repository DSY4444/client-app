import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import * as XLSX from 'xlsx';
import MDTypography from "components/MDTypography";
import { Icon, Card } from "@mui/material";
import { useEffect, useState } from "react";
import { getDomain } from 'utils';
import Axios from "axios";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";

const buildColumns = () => {
    return [
        {
            "Header": "Name",
            "accessor": "displayName",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value}
                </MDTypography>
            }
        },
        {
            "Header": "Description",
            "accessor": "description",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value}
                </MDTypography>
            }
        },
        {
            "Header": "",
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

const buildRows = (data, onDownload) => {
    const rows = [];
    if (Array.isArray(data) && data.length > 0) {
        data.forEach((r) => {
            let row = {};
            Object.keys(r).forEach((k) => {
                row[k.replace(/\./g, "__")] = r[k]
            });
            row["actions"] = (
                <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
                    <MDTypography display="flex" alignItems="center" component="a" href="#" onClick={() => r.type === "Asset" ? onDownload(r.type , r.def, r.displayName) : onDownload(r["name"], r["fileName"])} variant="caption" color="text" fontWeight="medium">
                        <Icon fontSize="small" >download</Icon>&nbsp;Download
                    </MDTypography>
                </MDBox>
            )
            rows.push(row);
        });
    }
    return rows;
}

const Templates = () => {

    const handleError = useHandleError();

    const handleDownload = async (name, fileDef, displayName) => {
        if(name === "Asset") {
            let def = JSON.parse(fileDef)
            let headerArr = []
            let headers = Object.assign([], def.fields.map( def => { return def.displayName }))
            headerArr.push(headers)
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet([]);
            XLSX.utils.sheet_add_aoa(ws, headerArr);
            XLSX.utils.book_append_sheet(wb, ws, '');
            XLSX.writeFile(wb, `${displayName} .xlsx`, { type: "array", bookType: "xlsx" });
        }else {
            const response = await Axios.get(`${domain}/api/templates/download/${name}?${("nc=" + Math.random()).replace(".", "")}`, { responseType: "blob" });
            var blob = new Blob([response.data]);
            var url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute("href", url);
            link.setAttribute("download", fileDef);
            link.style = "visibility:hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const domain = getDomain();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const columns = buildColumns();

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/templates/list`);
            var [err1, dataRes] = await fetchRequest.get(`/api/dataflow/assetTypes`);
            if (err || err1) {
                handleError(err);
            }
            else {
                let data1 = Object.assign([], data)
                dataRes.map( data => {
                    data["type"] = "Asset"
                    data["description"] = `${data.displayName} file - List of all the ${data.displayName} available across the organization`
                    data1.push(data)
                })
                setRows(buildRows(data1, handleDownload));
                setLoading(false);
            }
        }
        getList();
    }, [])

    if (loading) {
        return <YASkeleton variant="dashboard-loading" />;
    }

    if (loading === false && !rows) {
        return (
            <div>
                no data
            </div>
        );
    }

    return (
        <>
            <PageHeader title="Templates" subtitle="Download your template files for all your data uploads from here." />
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

export default AnimatedRoute(Templates);