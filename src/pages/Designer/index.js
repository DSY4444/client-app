import AnimatedRoute from "components/AnimatedRoute";
import PerfectScrollbar from 'react-perfect-scrollbar';
import CollapsiblePanel from "components/CollapsiblePanel";
import MDBox from "components/MDBox";
import Sidebar from "./components/Sidebar";
import { useState } from "react";
import SpendModel from "./components/SpendModel";
import Master from "./components/Master";
import Spend from "./components/Spend";
import MapRule from "./components/MapRule";
import SpendDistribution from "./components/SpendDistribution";
import AssetMapping from "./components/AssetMapping";
import { useImmer } from "use-immer";


const Designer = () => {

  const [menuItem, setMenuItem] = useState();
  const [refresh, setRefresh] = useState(null);
  const [yearFilter, setYearFilter] = useState(null);
  const [yearFilterName, setYearFilterName] = useState(null);
  const [years, setYears] = useState(null);
  const [months, setMonths] = useState([]);
  const [monthFilter, setMonthFilter] = useState();
  const [monthFilterName, setMonthFilterName] = useState();
  const [action, setAction] = useState(null);
  const [data, setData] = useImmer(null);

  const tabStyles = (_theme, { selected }) => ({
    color: selected ? "#435EC3" : "#adadad",
    textTransform: "none",
    backgroundColor: "#F7F8FD",
    "& .MuiButtonBase-root": {
        fontSize: "18px!important",
        transform: "none",
        backgroundColor: "#435EC3",
        
    },
    "&::after": selected ? {
        content: '""',
        position: "absolute",
        bottom: 0,
        height: 4,
        width: "60%",
        borderRadius: "0px",
        backgroundColor: "#435EC3"
    } : {}
});

let Assets = [];
if(data){
    data?.map(item => {
        item.subMenu?.map(i=>{
            if(i.title == "Assets" ){
                Assets.push(i.subMenu)
            }
        })
    })
}

    return (
        <MDBox width="100%" px={1} pt={1} >
            <MDBox width="100%" display="flex"
                sx={{
                    "& .collapsiblePanel-root": {
                        border: "none",
                        boxShadow: "0 0 15px rgba(0,0,0,0.05)",
                        zIndex:'999',
                    }
                }}
            >
                <CollapsiblePanel width={260} title="YäRKEN Designer" onClickTitle={() => setMenuItem(null)}>
                    <Sidebar menuItem={menuItem} data={data} setData={setData} setMenuItem={setMenuItem} yearFilter={yearFilter} setYearFilter={setYearFilter} setYearFilterName={setYearFilterName} years={years} refresh={refresh} setMonthFilter={setMonthFilter} setAction={setAction}/>
                </CollapsiblePanel>
                <MDBox display="block" maxHeight="calc(100vh - 68px)" width="100%" overflow="auto">
                <PerfectScrollbar>
                {menuItem === "Accounts" && <Master masterId="account" uploadType="account" uploadName={menuItem} refresh={refresh} setRefresh={setRefresh} tabStyles={tabStyles}/>}
                {menuItem === "Cost Centers" && <Master masterId="cost-center" uploadType="costCentre" uploadName={menuItem} refresh={refresh} setRefresh={setRefresh} tabStyles={tabStyles} />}
                {menuItem === "Vendors" && <Master masterId="vendor" uploadType="vendor" uploadName={menuItem} refresh={refresh} setRefresh={setRefresh} tabStyles={tabStyles} />}
                {menuItem === "Invoices" && <Master masterId="invoice" uploadType="invoice" uploadName={menuItem} refresh={refresh} setRefresh={setRefresh} tabStyles={tabStyles} />}
                {menuItem === "Purchase Orders" && <Master masterId="purchase-order" uploadType="purchaseOrder" uploadName={menuItem} refresh={refresh} setRefresh={setRefresh} tabStyles={tabStyles} />}
                {menuItem === "Contracts" && <Master masterId="contract" uploadType="contract" uploadName={menuItem} refresh={refresh} setRefresh={setRefresh} tabStyles={tabStyles} />}
                {menuItem === "Solution Offerings" && <Master masterId="solution-offerings" uploadType="solutionOffering" uploadName={menuItem} refresh={refresh} setRefresh={setRefresh} tabStyles={tabStyles} />}
                {menuItem === "Business Units" && <Master masterId="business-units" uploadType="businessUnit" uploadName={menuItem} refresh={refresh} setRefresh={setRefresh} tabStyles={tabStyles} />}
                {menuItem === "Asset Rules" && <AssetMapping masterId="consumption-asset-rules" uploadType="consumptionAssetRules" uploadName={menuItem} refresh={refresh} setRefresh={setRefresh} tabStyles={tabStyles} />}
                {Assets[0]?.map((item) => {
                    return (
                      menuItem === item.title &&  <Spend typeFilter={item.title}  uploadType = {item.name} asset={item.name} yearFilter={yearFilter}  yearFilterName={yearFilterName} tabStyles={tabStyles} refresh={refresh} setRefresh={setRefresh} assets = {Assets[0]}  />
                    )
                })}
                {menuItem === "Spend" && <Spend typeFilter={"Spend"} yearFilter={yearFilter} uploadType="expenditure" yearFilterName={yearFilterName} tabStyles={tabStyles} refresh={refresh} setRefresh={setRefresh}/>}
                {menuItem === "Budget" && <Spend typeFilter={"Budget"} yearFilter={yearFilter} uploadType="budget" yearFilterName={yearFilterName} tabStyles={tabStyles} refresh={refresh} setRefresh={setRefresh}/>}
                {menuItem === "Cost Pools" && <MapRule categoryFilter={"Cost Pool"} yearFilter={yearFilter} yearFilterName={yearFilterName} tabStyles={tabStyles} menuItem={menuItem} setMenuItem={setMenuItem} monthFilter={monthFilter} setMonthFilter={setMonthFilter} monthFilterName={monthFilterName} setMonthFilterName={setMonthFilterName} action={action} setAction={setAction} refresh={refresh} setRefresh={setRefresh}/>}
                {menuItem === "Towers" && <MapRule categoryFilter={"Tower"} yearFilter={yearFilter} yearFilterName={yearFilterName} tabStyles={tabStyles} menuItem={menuItem} setMenuItem={setMenuItem}  monthFilter={monthFilter} setMonthFilter={setMonthFilter} monthFilterName={monthFilterName} setMonthFilterName={setMonthFilterName} action={action} setAction={setAction} refresh={refresh} setRefresh={setRefresh}/>}
                {/* {menuItem === "Capabilities" && <SpendDistribution typeFilter={"Capabilities"} uploadType="assetRelationship" title="Capabilities" yearFilter={yearFilter} yearFilterName={yearFilterName} tabStyles={tabStyles} refresh={refresh} setRefresh={setRefresh} />} */}
                {menuItem === "Solutions" && <SpendDistribution typeFilter={"Solution"} yearFilter={yearFilter} uploadType="capabilityOffering" title="Solutions"  yearFilterName={yearFilterName} tabStyles={tabStyles} refresh={refresh} setRefresh={setRefresh} />}
                {/* {menuItem === "Business Unit" && <SpendDistribution typeFilter={"Business Unit"} uploadType="businessUnitOffering" title="Business Units"  yearFilter={yearFilter} yearFilterName={yearFilterName} tabStyles={tabStyles} refresh={refresh} setRefresh={setRefresh} />} */}
                {menuItem === "Business Unit" && <MapRule categoryFilter={"Business Unit"} yearFilter={yearFilter} yearFilterName={yearFilterName} tabStyles={tabStyles} menuItem={menuItem} setMenuItem={setMenuItem} monthFilter={monthFilter} setMonthFilter={setMonthFilter} monthFilterName={monthFilterName} setMonthFilterName={setMonthFilterName} action={action} setAction={setAction} refresh={refresh} setRefresh={setRefresh} />}
                {!menuItem && <SpendModel tabStyles={tabStyles} yearFilter={yearFilter} setYearFilter={setYearFilter} setYears={setYears} setYearFilterName={setYearFilterName} months={months} setMonths={setMonths} />}
                </PerfectScrollbar>
                </MDBox>
            </MDBox>
        </MDBox>
    )
}

export default AnimatedRoute(Designer)