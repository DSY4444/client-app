import MDTypography from "components/MDTypography";
import { useEffect, useState } from "react";
import PageHeader from "components/PageHeader";
import MDBox from "components/MDBox";
import MDBadge from "components/MDBadge";
import { Autocomplete, Divider, Icon, IconButton } from "@mui/material";
import MDInput from 'components/MDInput';
import YASkeleton from "components/YASkeleton";
import _ from "lodash";
import { useImmer } from "use-immer";
import AnimatedRoute from "components/AnimatedRoute";
import useFetchRequest from "hooks/useFetchRequest";
import numeral from "numeral";
import useHandleError from "hooks/useHandleError";
import { useAppController } from "context";
import MDButton from "components/MDButton";
import FilteredUploadedFiles from 'components/FilteredUploadedFiles';
import { formatAmount } from 'utils';

const SpendModel = (props) => {
    const { setYears, yearFilter, setYearFilter, setYearFilterName, months, setMonths, tabStyles } = props
    const { response: levelsRes, error: levelsErr, loading: levelsLoading } = useFetchRequest(`/api/dataflow/categories`);
    const handleError = useHandleError();
    const [levels, setLevels] = useImmer([]);
    const [monthFilter, setMonthFilter] = useState();
    const [selectedTab, setSelectedTab] = useState("Spend")
    // const [monthFilterName, setMonthFilterName] = useState();
    const [typeFilter, setTypeFilter] = useState("Spend");

    useEffect(() => {
        if (!levelsLoading) {
            if (levelsErr !== null) {
                handleError(levelsErr);
            }
            else if (levelsRes !== null) {
                let currentYearIndex = levelsRes.years?.length - 1;
                const currentFinancialYear = levelsRes.currentFinancialYear;
                if (currentFinancialYear) {
                    const index = levelsRes.years?.map(y => y.name).indexOf(currentFinancialYear.value);
                    if (index > -1)
                        currentYearIndex = index;
                }
                setLevels(levelsRes)
                setYears(levelsRes.years)
                setYearFilter(levelsRes.years[currentYearIndex]?.id)
                setYearFilterName(levelsRes.years[currentYearIndex]?.name);
                setMonths([{id:0, name: "All Months"},...levelsRes.months])
                setMonthFilter(0)
            }
        }
    }, [levelsLoading, levelsRes]);

    if (levelsLoading) {
        return <YASkeleton variant="dashboard-loading" />;
    }

    if (levelsLoading === false && levels === null) {
        return (
            <div>
                no data
            </div>
        );
    }

    const chipStyles = ({ palette: { white } }) => ({
        cursor: 'pointer',
        border:  'none',
        display: 'flex',
        flexDirection: 'row',
        minWidth: 133,
        pb: 1.5,
        alignItems: 'center',
        justifyContent: 'space-between',
        whiteSpace: 'nowrap',
        fontSize: '15px',
        backgroundColor: white,
        height: 32,
        position: 'relative',
        "&:hover": {
            backgroundColor: '#f3f3f3!important'
        },
        "&  .MuiOutlinedInput-notchedOutline" :  {border: 'none'},
        "& .MuiTypography-root, & .MuiIcon-root":  { color: '#435cc8!important' } ,
    })

    return (
        <>
            <PageHeader
                title={"Spend Model"}
                subtitle={"An overview of your modelled spend into cost pools and towers"}
                hideBreadcrumbs={true}
            />

            <MDBox display="flex" width="100%" sx={{ backgroundColor: "#F7F8FD", borderBottom: "1px solid #edeef3", borderTop: "1px solid #e3e3e3", display: "inline-flex" }} justifyContent="space-between">
                <MDBox display="flex" position="sticky">
                    <MDButton data-testid = {"SPEND".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: selectedTab === "Spend" })} onClick={() => {setSelectedTab("Spend"); setTypeFilter("Spend")}} >
                    <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight:"6px" }}>account_balance_wallet</Icon>
                      SPEND</MDButton>
                    <MDButton data-testid = {"BUDGET".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: selectedTab === "Budget" })} onClick={() => {setSelectedTab("Budget"); setTypeFilter("Budget")}}>
                    <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight:"6px" }}>pie_chart</Icon>
                       BUDGET</MDButton>
                    <MDButton data-testid = {"UPLOADED FILES".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: selectedTab === "uploaded" })} onClick={() => setSelectedTab("uploaded")}>
                    <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight: "6px" }}>file_present</Icon>
                        UPLOADED FILES</MDButton>
                </MDBox>
                {selectedTab != "uploaded" &&
                <MDBox display="flex" color='#435cc8!important' alignItems="center" sx={{ backgroundColor: "#F7F8FD"}} flexWrap="wrap">
                <MDTypography 
                    data-testid = {"Show data for".toLowerCase().replaceAll(' ', '')}
                    sx={() => ({
                    marginTop: -0.2,
                    marginRight: 0,
                    marginLeft: -0.5,
                    color: "#454545",
                    fontSize: '14px',
                  })} display={{ lg: "flex", md: "none", sm: "none", xs: "none" }}>Show data for &nbsp;</MDTypography> 
                <Icon fontSize="medium" color="dark">calendar_month</Icon>
                    <Autocomplete
                        disableClearable={true}
                        value={monthFilter || 0}
                        options={months}
                        onChange={(event, newValue) => {
                            setMonthFilter(newValue.id)
                        }}
                        color="text"
                        fontWeight="medium"
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: 40,
                                minWidth: 100,
                                maxHeight: 140
                            },
                            "& .MuiAutocomplete-endAdornment": {
                                top: '12px'
                            },
                            "& .MuiOutlinedInput-input": {
                                fontSize: 14,
                                fontWeight: 600
                            },
                            "& .MuiOutlinedInput-input, .MuiAutocomplete-input": { 
                            }
                        }}
                        isOptionEqualToValue={(option, value) => {
                            return option.id === value
                        }}
                        getOptionLabel={option => {
                            if (typeof option === "number")
                                return months.find(op => op.id === option)?.name;
                            return option.name
                        }}
                        
                        renderInput={(params) => <MDInput data-testid = {'MonthFilter'.toLowerCase().replaceAll(' ', '')} sx={(theme) => chipStyles(theme)} label="" {...params} />}
                    />
                </MDBox>}
            </MDBox>
            {
                yearFilter && selectedTab !== "uploaded" && (
                    <DataflowLevels levels={levels} yearFilter={yearFilter} typeFilter={typeFilter} monthFilter={monthFilter} />
                )
            }
            {selectedTab === "uploaded" && <FilteredUploadedFiles containerHeight="calc(100vh - 370px)" canFilter={true} yearFilter={yearFilter} />}
        </>
    );
}

const DataflowLevels = (props) => {
    const [data, setData] = useImmer(null);
    const handleError = useHandleError();
    const { levels, yearFilter, typeFilter, monthFilter } = props;
    const { costPools, towers, solutionTypes } = levels;
    const { response: dataRes, error: dataErr, loading: dataLoading } = useFetchRequest(`/api/dataflow/${typeFilter.toLowerCase()}Yearly/${yearFilter}/${monthFilter !== undefined ? monthFilter : 0}`);

    const [controller,] = useAppController();
    const { appDef: { featureSet } } = controller;
    const enableAssetDistribution = featureSet && featureSet.dataManagement?.assetDistribution === true;

    useEffect(() => {
        if (!dataLoading) {
            if (dataErr !== null) {
                console.log("dataerr")
                handleError(dataErr);
            }
            else if (dataRes !== null) {
                setData(dataRes);
            }
        }
    }, [dataLoading, dataRes, typeFilter]);

    if (dataLoading) {
        return <YASkeleton variant="dataflow-loading" />;
    }

    if (dataLoading === false && data === null) {
        return (
            <div>
                no data
            </div>
        );
    }

    const itemStyles = (color) => ({
        position: "relative",
        minWidth: 140,
        px: 2,
        pt: 0.5,
        pb: 1,
        m: 0.5,
        background: "#FFFFFF",
        boxShadow: "0 8px 16px #1a488e1f",
        borderLeft: `10px solid ${color}`,
        borderTop: "1px solid #f0eded",
        borderRight: "1px solid #f0eded",
        borderBottom: "1px solid #f0eded",
        borderRadius: "10px",
        "& .item-options": {
            display: "none"
        },
    });
    const disabledItemStyles = (color) => ({
        position: "relative",
        minWidth: 140,
        px: 2,
        pt: 0.5,
        pb: 1,
        m: 0.5,
        opacity: '70%',
        background: "#f1f2f6",
        borderLeft: `10px solid ${color}`,
        borderTop: "1px solid #f0eded",
        borderRight: "1px solid #f0eded",
        borderBottom: "1px solid #f0eded",
        borderRadius: "10px",
        "& .item-options": {
            display: "none"
        },
    });

    const distButtonStyles = () => ({
        padding: "3px 3px",
        marginLeft: "-5px",

    });

    const textButtonStyles = () => ({
        width: "100%",
        cursor: "pointer"
    });

    const buttonStyles = () => ({
        paddingLeft: "3px",
        paddingRight: "3px",
        "&:hover": {
            background: "#eceff8",
            // color: white.main,
            borderRadius: "5px",
        },
        "&:hover .MuiTypography-root": {
            background: "#eceff8",
            // color: white.main,
            borderRadius: "5px",
        },
        "&.MuiBox-root:hover .MuiIcon-root": {

            color: '#435EC3'

        }
    })

    const totalExpenditure = data.totalExpenditure[0].amount.toFixed(2);
    const costPoolExpenditure = _.sumBy(data.costPoolExpenditure, 'amount').toFixed(2);
    const towerExpenditure = _.sumBy(data.towerExpenditure, 'amount').toFixed(2);
    const solutionExpenditure = _.sumBy(data.solutionTypeExpenditure, 'amount').toFixed(2) ?? 0

    const unallocatedCostPoolExpenditure = totalExpenditure - costPoolExpenditure;
    const unallocatedTowerExpenditure = costPoolExpenditure - towerExpenditure;
    const unallocatedSolutionExpenditure = towerExpenditure - solutionExpenditure;

    const renderExpItem = (levelName, id, expName, distributed, unallocated, total, hidedist = false) => {
        let color = "white"
        if (levelName === "COST POOLS")
            color = "#435EC3"
        if (levelName === "TOWERS")
            color = "#F77B35"
        if (levelName === "SOLUTIONS")
            color = "darkGrey"
        return <MDBox key={`l_${expName}`} sx={() => (unallocated > 0) ? itemStyles(color) : disabledItemStyles(color)}>
            <MDBox>
                <MDBox alignItems="center" justifyContent="space-between" display="flex">
                    <MDBox>
                        {/* <IconButton size="small" sx={() => distButtonStyles()}>
                            <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)" }}>launch_sharp</Icon>

                        </IconButton> */}
                        <MDTypography variant="caption" fontWeight="medium" color={"text"}>
                            {expName}
                        </MDTypography>
                    </MDBox>
                    <MDBox sx={{ mt: "-30px", mr: "-10px" }} >
                    {(unallocated > 0 && unallocated.toFixed(0) === distributed.toFixed(0)) ? <Icon fontSize="small" color="success">check_circle</Icon> : <></>}
                    </MDBox>
                </MDBox>
                <MDBox display="flex" flexDirection="column" >
                    <MDBox display="flex" flexDirection="row" alignItems="center" sx={(theme) => buttonStyles(theme)}>
                        <IconButton size="small" sx={() => distButtonStyles()}>
                            <Icon color="dark" fontSize="small" sx={{ transform: "rotate(180deg)" }}>call_merge</Icon>
                        </IconButton>
                        <MDTypography variant="button" component="span" fontWeight="medium" color="dark" pl={0.3} sx={() => textButtonStyles()}>{formatAmount(unallocated.toFixed(0))} ({numeral(((unallocated / total) * 100.0).toFixed(2)).format('0.0')}%)</MDTypography>
                    </MDBox>
                    {!hidedist &&
                        <MDBox display="flex" flexDirection="row" alignItems="center" sx={(theme) => buttonStyles(theme)}>
                            <IconButton size="small" sx={() => distButtonStyles()}>
                                <Icon color="dark" fontSize="small" sx={{ transform: "rotate(180deg)" }}>call_split</Icon>
                            </IconButton>
                            <MDTypography variant="button" component="span" fontWeight="medium" color="dark" pl={0.3} sx={() => textButtonStyles()}>{formatAmount(distributed.toFixed(0))}</MDTypography>
                        </MDBox>
                    }
                </MDBox>
            </MDBox>
        </MDBox>
    }

    const renderLevel = (levelName, levelDef, expName, expType, distExpType, unallocated, total, hidedist) => {

        let arr = levelDef.map((item) => {
            return Object.assign({}, {
                "id": item.id, "name": item.name,
                "amount": _.find(data[expType], { [expName]: item.name }) ? _.find(data[expType], { [expName]: item.name }).amount : 0,
                "distributed": _.find(data[distExpType], { [expName]: item.name }) ? _.find(data[distExpType], { [expName]: item.name }).amount : 0,
            })
        })

        return (
            <MDBox>
                <Divider sx={{ mt: 6, opacity: 1 }} />
                <MDBox display="flex" alignItems="center" justifyContent="space-between" px={3} mb={3} mt={-4.5}>
                    <MDTypography data-testid = {levelName?.toLowerCase().replaceAll(' ', '')} variant="h6" component="span" fontWeight="medium" color={"text"} sx={{ pr: .5 }}>
                        {`${levelName}`}
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" justifyContent="center" flexDirection="row" py={1} px={2} sx={{ border: "1px solid #d5cfcf", borderRadius: "5px", background: "#F7F8FD" }}>
                        <MDTypography data-testid = {"Unallocated".toLowerCase().replaceAll(' ', '')} variant="button" fontWeight="medium" color="text">
                            Unallocated
                        </MDTypography>
                        {
                            unallocated && Number(numeral(Math.trunc(unallocated).toFixed(2)).format('0.0')) < 0 ?
                                (
                                    <MDBadge badgeContent={`${formatAmount(Math.trunc(unallocated))} (${numeral(((unallocated / total) * 100.0).toFixed(2)).format('0.0')}%)`} color="error" size="md" />
                                ) : (
                                    <MDTypography ml={2} variant="button" component="span" fontWeight="medium" color="text">
                                        {formatAmount(Math.trunc(unallocated))} ({numeral(((unallocated / total) * 100.0).toFixed(2)).format('0.0')}%)
                                    </MDTypography>
                                )
                        }
                    </MDBox>
                    <MDBox></MDBox>
                </MDBox>
                <MDBox display="flex" flexDirection="row" flexWrap="wrap" alignItems="center" justifyContent="center">
                    {
                        arr.map((l) => {
                            return renderExpItem(levelName, l["id"], l["name"], l["distributed"], l["amount"], total, hidedist);
                        })
                    }
                </MDBox>
            </MDBox>)
    }
    return (
        <MDBox >
            <MDBox sx={{ background: "#F7F8FD", paddingTop: "20px", paddingBottom: "50px" }}>
                <MDBox display="flex" flexDirection="row" flexWrap="wrap" alignItems="center" justifyContent="center" >
                    <MDBox sx={(theme) => itemStyles(theme)} >
                        <MDTypography data-testid = {typeFilter?.toLowerCase().replaceAll(' ', '')} variant="button" fontWeight="medium" color={"text"}>
                            {typeFilter}
                        </MDTypography>
                        <MDBox display="flex" flexDirection="row" justifyContent="space-between" minWidth={275} pb={.3}>
                            <MDBox display="flex" flexDirection="column" flex={1}>
                                <MDTypography data-testid = {formatAmount(totalExpenditure)?.toLowerCase().replaceAll(' ', '')} variant="h4" component="span" fontWeight="medium" color="dark">{formatAmount(totalExpenditure)}</MDTypography>
                                <MDTypography data-testid = {"Total".toLowerCase().replaceAll(' ', '')} variant="caption" component="span" fontWeight="medium" color="text">Total</MDTypography>
                            </MDBox>
                            <MDBox display="flex" flexDirection="column" flex={1} ml={1}>
                                <MDTypography data-testid = {formatAmount(costPoolExpenditure)?.toLowerCase().replaceAll(' ', '')} variant="h4" component="span" fontWeight="medium" color="dark">{formatAmount(costPoolExpenditure)}</MDTypography>
                                <MDTypography data-testid = {"Allocated".toLowerCase().replaceAll(' ', '')} variant="caption" component="span" fontWeight="medium" color="text">Allocated</MDTypography>
                            </MDBox>
                        </MDBox>
                    </MDBox>
                </MDBox>
                {renderLevel("COST POOLS", costPools, "costPool.name", "costPoolExpenditure", "costPoolTowerExpenditure", unallocatedCostPoolExpenditure, totalExpenditure, false)}
                {renderLevel("TOWERS", towers, "tower.name", "towerExpenditure", "towerSolutionTypeExpenditure", unallocatedTowerExpenditure, costPoolExpenditure, !enableAssetDistribution,)}
                {enableAssetDistribution && renderLevel("SOLUTIONS", solutionTypes, "solutionType.name", "solutionTypeExpenditure", "solutionTypeExpenditure", unallocatedSolutionExpenditure, towerExpenditure, true)}
            </MDBox>
        </MDBox>
    );
}


export default AnimatedRoute(SpendModel);