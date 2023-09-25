import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Icon, Card, IconButton, Modal } from "@mui/material";
import { useState,useEffect } from "react";
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
import MDAvatar from "components/MDAvatar";
import Axios from "axios";
import useHandleError from "hooks/useHandleError";
import { useImmer } from "use-immer";
import { Autocomplete } from "@mui/material";
import MDInput from "components/MDInput";
import DataloadDialog from "components/DataloadDialog";

const ConsumptionDataloadPage = (props) => {

    const { showAlert, showPrompt, showSnackbar } = useYADialog();
    const [openErr, setOpenErr] = useState(false);
    const [errors, setErrors] = useState([]);
    const [ufData, setUFData] = useState({});
    const { response: rulesRes, error: rulesErr, loading: rulesLoading } = useFetchRequest(`/api/dataflow/categories`);
    const handleError = useHandleError();
    const [levels, setLevels] = useImmer([]);
    const [yearFilter, setYearFilter] = useState(null);
    const [monthFilter, setMonthFilter] = useState(null);
    const [yearFilterName, setYearFilterName] = useState(null);
    const [monthFilterName, setMonthFilterName] = useState(null);
    const [act, setAct] =useState(null);
    const [destinationTable, setDestinationTable] = useState("")
    const [popup, setpopup] = useState(false)
    const [popupColumns, setpopupColums] = useState([])
    const [popupRows, setpopupRows] = useState([])
    const uploadConfig = { monthFilter: monthFilter, yearFilter: yearFilter, yearFilterName: yearFilterName, monthFilterName: monthFilterName,uploadType: null,uploadCategory : "Consumption"}
    useEffect(() => {
        if (!rulesLoading) {
            if (rulesErr !== null) {
                handleError(rulesErr);
            }
            else if (rulesRes !== null) {
                let currentYearIndex = rulesRes.years?.length - 1;
                const currentMonthNumber = (new Date().getMonth()) + 1;
                const currentMonth = rulesRes.months.find(m => m.id === currentMonthNumber);
                const currentFinancialYear = rulesRes.currentFinancialYear;
                if (currentFinancialYear) {
                    const index = rulesRes.years?.map(y => y.name).indexOf(currentFinancialYear.value);
                    if (index > -1)
                        currentYearIndex = index;
                }
                setLevels(rulesRes);
                setYearFilter(rulesRes.years[currentYearIndex]?.id);
                setYearFilterName(rulesRes.years[currentYearIndex]?.name);
                setMonthFilter(currentMonth?.id);
                setMonthFilterName(currentMonth?.name);
            }
        }
    }, [rulesLoading, rulesRes]);
   
    const { uploadType } = props

    const { response: rows, error: _err, loading, reloadData } = (uploadType) ? useFetchRequest(`/api/dataload/list/consumption/${uploadType}/${yearFilter}/${monthFilter}`) : useFetchRequest(`/api/dataload/list/consumption/${yearFilter}/${monthFilter}`);
    
    // const { response, error: _err1, loading1 } = useFetchRequest(`/api/dataload/dataloadTypes`);
    const handleErrDialogClose = () => {
        setOpenErr(false);
    }
    const handlePopup = () => {
        setpopup(false)
    }
    
    const buildPopupColumns = () => {
        let columns = [
            { Header: "Destination", accessor: "destination", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" alignItems="center" fontWeight="medium" color="dark">{value}</MDTypography> } },
            { Header: "Source", accessor: "source", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" alignItems="center" fontWeight="small" color="dark">{value}</MDTypography> } }
        ]
        return columns;
    }
    
    const buildPopupRows = (item, def) => {
        let rows = item.map(i => {
            let destination = "";
            if (def?.type == "Assets") {
                def?.fields.map(j => {
                    if(j.name == i.destinationColumn){
                        destination = j.displayName;
                    }
                    if(!destination){
                        if(j.schemaName == i.destinationColumn)
                          destination = j.displayName;
                    }
                })
            }
            else {
                def?.fields.map(j => {
                    if (j.name == i.destinationColumn) {
                        destination = j.displayName;
                    }
                })
            }
            return {
                "destination": destination,
                "source": i.sourceColumn
            }
        })
        return rows
    }
    
    const viewMapping = async (item, def, destination) => {
        setDestinationTable(destination)
        setpopupColums(buildPopupColumns());
        setpopupRows(buildPopupRows(JSON.parse(item), def));
        setpopup(true)
    }

    const handleDelete = (item) => {
        showPrompt("Delete", "Are you sure you want to delete - [" + item["originalFileName"] + "]", async () => {
            var [err1, data] = await fetchRequest.delete(`/api/dataflow/uploadedFile/${item["id"]}`)
            if (err1) {
                console.error(err1)
                showAlert("Delete", "Something went wrong. Contact your administrator.");
            }
            else if (data) {
                showSnackbar(data, "success")
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

    const buildColumns = (onDownload, onDelete, onViewErrors) => {
        return [
            // { Header: "File Type", accessor: "fileType", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Type", accessor: "displayName", dataType:"textbox", disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark"><b>{value}</b></MDTypography> } },
            { Header: "File Name", accessor: "originalFileName", dataType:"textbox", disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "File Status", accessor: "fileStatus", dataType:"textbox", disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Loaded Records", accessor: "loadedRecords", disableFilters: true, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Total Records", accessor: "totalRecords", disableFilters: true,  Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            {
                Header: "Errors", accessor: "errors", disableFilters: true,  Cell: ({ cell: { row: { original } } }) => {
                    return original.errors !== '[]' &&
                        original?.errors !== '' &&
                        original?.errors !== '{}' &&
                        original?.errors !== null
                        ? <IconButton sx={{ padding: 0, paddingLeft: '8px' }} onClick={() => onViewErrors(original)}><Icon color="error">error</Icon></IconButton>
                        : ''
                }, "type": "showonvalue"
            },
            { Header: "Mapping fields", accessor: "mappingFields", disableFilters: true, Cell: ({ row }) => { return <IconButton sx={{ padding: 0, paddingLeft: '8px' }} onClick={() => { viewMapping(row.values.mappingFields, row.original.def, row.values.destinationTable) }}><Icon color="info">info</Icon></IconButton> } },
            { Header: "Uploaded On", accessor: "createdAt", disableFilters: true, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY") : ""}</MDTypography> } },
            { Header: "Uploaded By", accessor: "createdByUser__name",disableFilters: true, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" display="flex" alignItems="center" justifyContent="flex-start" ><MDAvatar name={value} size="xs" sx={{mr: .75}} />{value}</MDTypography> } },
            { Header: "Download", disableSorting: true, accessor: "",disableFilters: true, Cell: ({ cell: { row: { original }} }) => { return <IconButton sx={{ padding: 0 }} onClick={() => onDownload(original)}><Icon>download</Icon></IconButton> } },
            { Header: "Delete", disableSorting: true, accessor: "id",disableFilters: true, Cell: ({ row : { original } }) => { return <IconButton sx={{ padding: 0 }} onClick={() => onDelete(original)}><Icon color="error">delete</Icon></IconButton> } },
        ];
    }

    const columns = buildColumns(handleDownload, handleDelete, handleViewErrors);

    const handleUploadDialogClose = (uploadSuccess) => {
        if (uploadSuccess)
            reloadData();
        setAct(false)
    };

    // const handleAddButtonClick = () => {
    //     showUploadDialog(`Upload for ${monthFilterName}, FY ${yearFilterName}`, {}, handleUploadDialogClose);
    // }

    const renderAddButton = () => (
       <>
        <MDButton variant="gradient" color="info" startIcon={<Icon>cloud_upload</Icon>} onClick={()=> {setAct(true)}}>
            Upload
        </MDButton>
       </>
    )

    if (loading ) {
        return <YASkeleton variant="dashboard-loading" />;
    }
    if (_err) {
        console.error(_err)
    }

    rows?.map((item) => {
            item["createdByUser__name"] = item["createdByUser.name"];
    })


    if (rulesLoading) {
        return <YASkeleton variant="dashboard-loading" />;
    }

    if (rulesLoading === false && levels === null) {
        return (
            <div>
                no data
            </div>
        );
    }
    const renderFilters = () => (
        <>
            <MDBox display="flex">
                
                
                <Autocomplete
                    disableClearable={true}
                    value={yearFilter}
                    options={levels.years}
                    onChange={(event, newValue) => {
                    setYearFilter(newValue.id)
                    setYearFilterName(newValue.name)
                    }}
                    color="text"
                    fontWeight="medium"
                    sx={{
                    ml: 1.5,
                    "& .MuiOutlinedInput-root": {
                        height: 42,
                        minWidth: 130,
                        boxShadow: "0 8px 16px #1a488e1f"
                    },
                    "& .MuiOutlinedInput-input": {
                        fontSize: 14
                    },
                    "& .MuiOutlinedInput-input.MuiAutocomplete-input": {
                        padding: .5
                    }
                    }}
                    isOptionEqualToValue={(option, value) => {
                    return option.id === value
                    }}
                    getOptionLabel={option => {
                    if (typeof option === "number")
                        return levels.years.find(op => op.id === option)?.name;
                    return option.name
                    }}
                    renderInput={(params) => <MDInput data-testid = {"yearFilter".toLowerCase().replaceAll(' ', '')} label="Year" {...params} />}
                />
                <Autocomplete
                    disableClearable={true}
                    value={monthFilter}
                    options={levels.months}
                    onChange={(event, newValue) => {
                    setMonthFilter(newValue.id)
                    setMonthFilterName(newValue.name)
                    }}
                    color="text"
                    fontWeight="medium"
                    sx={{
                    ml: 0.5,
                    "& .MuiOutlinedInput-root": {
                        height: 42,
                        width: 100,
                        boxShadow: "0 8px 16px #1a488e1f"
                    },
                    "& .MuiOutlinedInput-input": {
                        fontSize: 14
                    },
                    "& .MuiOutlinedInput-input.MuiAutocomplete-input": {
                        padding: .5
                    }
                    }}
                    isOptionEqualToValue={(option, value) => {
                    return option.id === value
                    }}
                    getOptionLabel={option => {
                    if (typeof option === "number")
                        return levels.months.find(op => op.id === option)?.name;
                    return option.name
                    }}
                    renderInput={(params) => <MDInput data-testid = {"monthFilter".toLowerCase().replaceAll(' ', '')} label="Month"{...params} />}
                />
                <MDButton data-testid = {"Upload".toLowerCase().replaceAll(' ', '')} variant="gradient" color="info" startIcon={<Icon>cloud_upload</Icon>} onClick={()=> {setAct(true)}} sx={{marginLeft: "5px"}}>
                    Upload
                </MDButton>
            </MDBox>
        </>
    )

    return (
        <>
                    
            {!uploadType && <PageHeader
                title={"Consumption Data Upload"}
                subtitle={"Screen to upload your consumption data"}
                primaryActionComponent={renderFilters}
            />}
            {act && <DataloadDialog title={`Upload for ${monthFilterName}, FY ${yearFilterName}`} uploadConfig={uploadConfig} onClose={handleUploadDialogClose}/>}
            <MDBox p={3} pt={1}>
                {
                    (!loading && rows?.length > 0) &&
                     
                        <Card sx={{ height: "100%" }} px={0}>
                            <DataTable
                                yearFilter={yearFilter} 
                                monthFilter={monthFilter}
                                table={{ columns, rows }}
                                showTotalEntries={true}
                                isSorted={true}
                                newStyle1={true}
                                noEndBorder
                                entriesPerPage={true}
                                canSearch={true}
                                canFilter={true}
                            />
                        </Card>
                    
                }
                {
                    (!loading && rows?.length === 0) && (
                        <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="calc(100vh - 300px)">
                            <EmptyState
                                yearFilter={yearFilter} 
                                monthFilter={monthFilter}
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
                ( yearFilter && monthFilter) && openErr && <DataloadErrorsDialog info={ufData} rows={errors} onErrDialogClose={handleErrDialogClose} />
            }
            <Modal open={popup} onClose={handlePopup}>
                <MDBox pt={20} pl={50} pr={50} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
                    <Card sx={{ height: "75%", width: "95%", overflow: 'hidden' }}>
                        <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                            <MDBox>
                                <MDTypography variant="h6" component="span" color="text">
                                    Mapping for {destinationTable}
                                </MDTypography>
                            </MDBox>
                            <MDBox display="flex">
                                <IconButton onClick={handlePopup} title="Close">
                                    <Icon>close</Icon>
                                </IconButton>
                            </MDBox>
                        </MDBox>
                        <DataTable
                            table={{ columns: popupColumns, rows: popupRows }}
                            containerMaxHeight={474}
                            showTotalEntries={true}
                            entriesPerPage={true}
                        >
                        </DataTable>
                    </Card>
                </MDBox>
            </Modal>
        </>
    );
};

export default AnimatedRoute(ConsumptionDataloadPage);