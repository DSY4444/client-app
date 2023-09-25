import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Icon, Card, IconButton } from "@mui/material";
import { useState } from "react";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import { useYADialog } from "components/YADialog";
import EmptyState from "components/EmptyState";
import new_item_img from "assets/svg/add_new.svg";
import MDButton from "components/MDButton";
import moment from "moment";
import useFetchRequest from "hooks/useFetchRequest";
import DataloadErrorsDialog from "components/DataloadErrorsDialog";
import _ from 'lodash';
import MDAvatar from "components/MDAvatar";
import Axios from "axios";


const buildColumns = (onDownload, onDelete, onViewErrors) => {
    return [
        // { Header: "File Type", accessor: "fileType", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Type", accessor: "displayName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "File Name", accessor: "originalFileName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "File Status", accessor: "fileStatus", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Loaded Records", accessor: "loadedRecords", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Total Records", accessor: "totalRecords", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        {
            Header: "Errors", accessor: "errors", Cell: ({ cell: { row: { original } } }) => {
                return original.errors !== '[]' &&
                    original?.errors !== '' &&
                    original?.errors !== '{}' &&
                    original?.errors !== null
                    ? <IconButton sx={{ padding: 0, paddingLeft: '8px' }} onClick={() => onViewErrors(original)}><Icon color="error">error</Icon></IconButton>
                    : ''
            }, "type": "showonvalue"
        },
        { Header: "Uploaded On", accessor: "createdAt", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY") : ""}</MDTypography> } },
        { Header: "Uploaded By", accessor: "createdByUser__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" display="flex" alignItems="center" justifyContent="flex-start" ><MDAvatar name={value} size="xs" sx={{mr: .75}} />{value}</MDTypography> } },
        // { Header: "Download", disableSorting: true, accessor: "", Cell: ({ cell: { row: { original }, value } }) => { return <IconButton sx={{ padding: 0 }} onClick={() => retrieveGetURL(original)}><Icon>download</Icon></IconButton> } },
        // { Header: "Delete", disableSorting: true, accessor: "id", Cell: ({ row }) => { return <IconButton sx={{ padding: 0 }} onClick={() => handleDelete(row.values)}><Icon color="error">delete</Icon></IconButton> } },
        {
            Header: "Download", disableSorting: true, accessor: "id", Cell: ({ cell: { row: { original } } }) => {
                return <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
                    <MDTypography display="flex" alignItems="center" component="a" href="#" onClick={() => onDownload(original)} variant="caption" color="text" fontWeight="medium">
                        <Icon fontSize="small" >download</Icon>
                    </MDTypography>
                    {/* <MDTypography display="flex" alignItems="center" ml={3} component="a" href="#" onClick={() => onDelete(original)} variant="caption" color="text" fontWeight="medium">
                        <Icon fontSize="small" color="error">delete</Icon>&nbsp;Delete
                    </MDTypography> */}
                </MDBox>
            }
        },
        // { Header: "Generated File Name", accessor: "fileName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    ];
}

const Dataload = (props) => {

    const { showUploadDialog, showAlert, showPrompt, showSnackbar } = useYADialog();
    const [openErr, setOpenErr] = useState(false);
    const [errors, setErrors] = useState([]);
    const [ufData, setUFData] = useState({});
    const { uploadType } = props

    const { response: rows, error: _err, loading, reloadData } = (uploadType) ? useFetchRequest(`/api/dataload/list/${uploadType}`) : useFetchRequest(`/api/dataload/list`);
    const { response: uploadTypes, error: _err1, loading1 } = useFetchRequest(`/api/dataload/dataloadTypes`);

    const handleErrDialogClose = () => {
        setOpenErr(false);
    }

    const handleDelete = (item) => {
        showPrompt("Delete", "Are you sure you want to delete - [" + item["originalFileName"] + "]", async () => {
            var [err1, data] = await fetchRequest.delete(`/api/dataload/uploadedFile/${item["id"]}`)
            if (err1) {
                console.error(err1)
                showAlert("Delete", "Something went wrong. Contact your administrator.");
            }
            else if (data) {
                showSnackbar(data?.message, "success")
                reloadData()
            }
        })
    }

    const handleDownload = async (item) => {
        var [err1, data] = await fetchRequest.get(`/api/blob/presignedGet/${item["id"]}`)
        if (err1)
            alert(err1)
        if (data) {
            const response = await Axios.get(data, { responseType: "blob" });
            var blob = new Blob([response.data]);
            var url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute("href", url);
            link.setAttribute("download", item.originalFileName);
            link.style = "visibility:hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const handleViewErrors = async (item) => {
        if (item.errors) {
            setErrors(JSON.parse(item.errors.replace(/'/g, "")))
            setUFData(item);
            setOpenErr(true)
        }
    }

    const columns = buildColumns(handleDownload, handleDelete, handleViewErrors);

    const handleUploadDialogClose = (uploadSuccess) => {
        if (uploadSuccess)
            reloadData();
    };

    const handleAddButtonClick = () => {
        showUploadDialog("Data Upload", {}, handleUploadDialogClose);
    }

    const renderAddButton = () => (
        <MDButton variant="gradient" color="info" startIcon={<Icon>cloud_upload</Icon>} onClick={handleAddButtonClick}>
            Upload
        </MDButton>
    )

    if (loading || loading1) {
        return <YASkeleton variant="dashboard-loading" />;
    }

    if (loading1) {
        return <YASkeleton variant="dashboard-loading" />;
    }
    
    if (_err1) {
        console.error(_err1)
    }
    if (_err) {
        console.error(_err)
    }

    var fileNames =[]
    if (!loading1) {
        uploadTypes?.map((item) =>
            item.subTypes.map(itm => fileNames.push(itm))
        )
    }

    rows?.map((item) => {
        item.displayName = 
        _.find(fileNames, {
            name: item.destinationTable
          }) ? _.find(fileNames, {
            name: item.destinationTable
          }).displayName : item.destinationTable
        item["createdByUser__name"] = item["createdByUser.name"];
    })

    return (
        <>
            {!uploadType && <PageHeader title="Data Upload" subtitle="Screen to manage data upload" primaryActionComponent={renderAddButton} />}
            <MDBox p={3} pt={1}>
                {
                    (!loading && rows?.length > 0) && (
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
                    )
                }
                {
                    (!loading && rows?.length === 0) && (
                        <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="calc(100vh - 300px)">
                            <EmptyState
                                size="large"
                                image={new_item_img}
                                title={"No Dataloads Yet"}
                                description={"Click on the 'upload' button to start a new dataload."}
                                actions={renderAddButton}
                            />
                        </MDBox>
                    )
                }
            </MDBox>
            {
                openErr && <DataloadErrorsDialog info={ufData} rows={errors} onErrDialogClose={handleErrDialogClose} />
            }
        </>
    );
};

export default AnimatedRoute(Dataload);