import AnimatedRoute from "components/AnimatedRoute";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Icon, IconButton } from "@mui/material";
import { formatAmount } from 'utils';
import DataTable from "components/DataTable";

const itemStylesRow = () => ({
    display: "flex",
    flexDirection: "row",
    width: '400px',
    pt: 0.1,
    py: 0,
    mx: 2.5,
    mb: 1,
    borderRadius: "2px",
    border: "1px solid #ddd",    
});

const itemStylesList = () => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    pt: 0.1,
    py: 0,
    mx: 2.5,
    my: 1,
    borderRadius: "2px",
    border: "1px solid #ddd",
    "& .title": {
        marginBottom: 0.2
    },
});

const itemStyles = () => ({
    // ml:4, fs: 14,
    py: 0,
    mx: -3,
    cursor: "pointer", 
    color: "text",

});

const AnnualSummary = (props) => {
    const { data, yearFilterName, setMonthFilter, setMonthFilterName, setOpenSummaryView} = props;

    var masterData = [];
    var itm = {}
    const masterColumns = data.master.map((item) => {
        itm[item.name] = item.value[0].count
        return (
            {
                Header: item.name, disableSorting: true, accessor: item.name, Cell: ({ cell: { value } }) => {
                    return ( 
                        <>
                            <MDTypography variant="caption" color="dark" fontWeight="bold" fontSize="14px" sx={{ p: 0, m: 0, fs: 14 }} onClick={() => {}}>
                                {value === 0 ?
                                    <>
                                        <IconButton>
                                            <Icon size="small" color="error" title="Not Loaded">close</Icon>
                                        </IconButton>
                                    </>
                                :
                                    <>
                                        <IconButton>
                                            <Icon size="small" color="success" title="Loaded">done</Icon>
                                        </IconButton>{value} 
                                    </>
                                }
                            </MDTypography> 
                        </>
                    )
                } 
            }
        )
    })
    masterData.push(itm)

    var listData = [];
    itm = {}
    const listColumns = data.list.map((item) => {
        itm[item.name] = item.value[0].count
        return (
            {
                Header: item.name, disableSorting: true, accessor: item.name, Cell: ({ cell: { value } }) => {
                    return ( 
                        <>
                            <MDTypography variant="caption" color="dark" sx={{ p: 0, m: 0, fs: 14 }} onClick={() => {}}>
                                {value === 0 ?
                                    <>
                                        <IconButton>
                                            <Icon size="small" color="error" title="Not Loaded">close</Icon>
                                        </IconButton>
                                    </>
                                :
                                    <>
                                        <IconButton>
                                            <Icon size="small" color="success" title="Loaded">done</Icon>
                                        </IconButton>{value} 
                                    </>
                                }
                            </MDTypography> 
                        </>
                    )
                } 
            }
        )
    })
    listData.push(itm)

    var monthlyData = [];
    var mth = []
    const monthlyColumns = [{Header: '', accessor: 'header' , disableSorting: true, Cell: ({ cell: { value } }) => {
        let heading= value.split('-')
        return ( 
            <>  <MDTypography  display="flex" flexDirection="column" alignItems="left" justifyContent="flex-start" variant="caption"   >
                    <MDTypography variant="button" component="span" fontWeight="medium" pt={1.2} pb={0.5} mt={0.4} >{heading[0]}</MDTypography>
                    <MDTypography variant="button" component="span" fontWeight="medium" pt={0.35} >{formatAmount(Math.abs(heading[1])).replace(/ /g, '').replace('.0', '')}</MDTypography> 
                    </MDTypography>
            </>
        )
    }  }]
    data.month.map((item, idx) => {
        mth.push(item.name);
        monthlyColumns.push (
                {Header: item.name, disableSorting: true, accessor: item.name, align: "left",  Cell: ({ cell: { value } }) => {
                    return ( 
                        <>
                            <MDTypography  display="flex" flexDirection="column" alignItems="left" justifyContent="flex-start" variant="caption"  sx={(theme) => itemStyles(theme)} onClick={() => {setMonthFilter(data.month[idx].id), setMonthFilterName(data.month[idx].name); setOpenSummaryView(false);}}>
                                {value === -1 ?
                                    <>
                                      <MDTypography variant="button" fontWeight="medium" px={2} py={0}>
                                     <IconButton component="span"  >
                                            <Icon size="small"  color="error" title="Not Loaded/Mapped">close</Icon>
                                        </IconButton>
                                        </MDTypography>
                                        <MDTypography variant="button" component="span" fontWeight="medium" color="text">
                                            &nbsp;
                                        </MDTypography>
                                     
                                      
                                    </>
                                :
                                    <>
                                     <MDTypography variant="button" fontWeight="medium" px={3} py={0}>
                                     <IconButton component="span"  >
                                            <Icon size="small" color="success" title="Loaded/Mapped">done</Icon>
                                        </IconButton>
                                     </MDTypography>
                                        <MDTypography variant="button" fontWeight="medium" px={3} py={0}>
                                           {formatAmount(Math.abs(value)).replace(/ /g, '').replace('.0', '')} &nbsp;
                                        </MDTypography>
                                    </>
                                }
                            </MDTypography> 
                        </>
                    )
                } 
            }
        )
    })
    var flag = false;
  
    data.actual.map((item) => {
       let Total =0 
       if(item.value){
       item.value.forEach(element => {
       Total=Total+element.amount
       });}

        itm = {}
        itm.name = item.name
        itm.values = {}
        itm.values["total" ] =formatAmount(Math.abs(Total)).replace(/ /g, '').replace('.0', '')
        itm.values["header"] = `${item.name}-${Total}`
        mth.map((i) => {
            flag = false;
            for (var j=0; j < item.value.length; j++) {
                if (item.value[j]["monthName.name"] == i) {
                    itm.values[i] = item.value[j]["amount"];
                    flag = true;
                }
            }
            if (!flag)
                itm.values[i] = -1;
        })
        monthlyData.push(itm)
    })

    data.budget.map((item) => {
        let Total =0 
        if(item.value){
        item.value.forEach(element => {
        Total=Total+element.amount
        });}
        itm = {}
        itm.name = item.name
        itm.values = {}
        itm.values["total" ] =formatAmount(Math.abs(Total)).replace(/ /g, '').replace('.0', '')
        itm.values["header"] = `${item.name}-${Total}`
        mth.map((i) => {
            flag = false;
            for (var j=0; j < item.value.length; j++) {
                if (item.value[j]["monthName.name"] == i) {
                    itm.values[i] = item.value[j]["amount"];
                    flag = true;
                }
            }
            if (!flag)
                itm.values[i] = -1;
        })
        monthlyData.push(itm)
    })
    var dataRows = monthlyData.map(item => {
        return item.values
    })

    return (
        <>
            <MDBox display="flex" flexDirection="row" justifyContent="space-between">
                <MDBox px={3} pt={-2} display="flex" flexDirection="column" alignItems="flex-start">
                    <MDBox>
                        <MDTypography variant="h6" component="span" color="text">
                            Annual Summary - Control Sheet ({yearFilterName})
                        </MDTypography>
                    </MDBox>
                    <MDBox>
                        <MDTypography variant="subtitle2" component="span" color="text">
                            Summarised annual view of your data uploads and mappings
                        </MDTypography>
                    </MDBox> 
                </MDBox> 
                <MDBox display="flex" flexDirection="row" key={`master`} sx={(theme) => itemStylesRow(theme)}>
                    <DataTable
                        variant="tile"
                        table={{ columns: masterColumns, rows: masterData }}
                        showTotalEntries={false}
                        isSorted={false}
                        newStyle1={true}
                        entriesPerPage={false}
                        canSearch={false}
                    >
                    </DataTable>
                </MDBox>
            </MDBox>

            <MDBox display="flex" flexDirection="row" key={`list`} sx={(theme) => itemStylesList(theme)}>
                <DataTable
                    variant="tile"
                    table={{ columns: listColumns, rows: listData }}
                    showTotalEntries={false}
                    isSorted={false}
                    entriesPerPage={false}
                    canSearch={false}
                >
                </DataTable>
            </MDBox>

            <MDBox display="flex" flexDirection="row" key={`monthly`} sx={(theme) => itemStylesList(theme)}>
                <DataTable
                    variant="tile"
                    table={{ columns: monthlyColumns, rows: dataRows }}
                    showTotalEntries={false}
                    isSorted={false}
                    entriesPerPage={false}
                    canSearch={false}
                    noEndBorder
                >
                </DataTable>
            </MDBox>
        </>
    );

    
};

export default AnimatedRoute(AnnualSummary);
