import { Autocomplete } from "@mui/material";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import MDBox from "components/MDBox";
import useFetchRequest from "hooks/useFetchRequest";
import MDInput from "components/MDInput";
import YASkeleton from "components/YASkeleton";
import useHandleError from "hooks/useHandleError";
import TowerMappingView from "components/TowerMappingView";

const Overallocation = () => {
    const { response: rulesRes, error: rulesErr, loading: rulesLoading } = useFetchRequest(`/api/dataflow/categories`);
    const handleError = useHandleError();
    const [levels, setLevels] = useImmer([]);
    const [yearFilter, setYearFilter] = useState(null);
    const [monthFilter, setMonthFilter] = useState(null);

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
                setMonthFilter(currentMonth?.id);
            }
        }
    }, [rulesLoading, rulesRes]);


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
        <MDBox display="flex">


            <Autocomplete
                disableClearable={true}
                value={yearFilter}
                options={levels.years}
                onChange={(event, newValue) => {
                    setYearFilter(newValue.id)
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
                renderInput={(params) => <MDInput label="Year" {...params} />}
            />
            <Autocomplete
                disableClearable={true}
                value={monthFilter}
                options={levels.months}
                onChange={(event, newValue) => {
                    setMonthFilter(newValue.id)
                }}
                color="text"
                fontWeight="medium"
                sx={{
                    ml: 1.5,
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
                renderInput={(params) => <MDInput label="Month"{...params} />}
            />
        </MDBox>
    )

    return (
        <>
            <PageHeader
                title={"Overallocation"}
                subtitle={"List of Overallocation Rules"}
                primaryActionComponent={renderFilters}
            />
            <TowerMappingView yearFilter={yearFilter} monthFilter={monthFilter} overallocation={true} typeFilter="Spend" />
        </>
    );
};

export default AnimatedRoute(Overallocation);