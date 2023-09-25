import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Icon } from "@mui/material";
import MDButton from "components/MDButton";
import YAScrollbar from "components/YAScrollbar";
import numeral from "numeral";
import YADataTable from "components/YADataTable";
import { useMemo } from "react";
import { toNumber } from "utils";
import _ from "lodash";

const tableAnswerStyles = () => ({
    flex: 1,
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
});


const AllocationsTable = ({ inbound, rows }) => {

    const columns = [
        {
            Header: inbound ? "Mapped From" : "Mapped To",
            accessor: "name",
            align: "left",
            Cell: ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">{value || "(empty)"}</MDTypography>
            }
        },
        {
            Header: "Mapped %",
            accessor: "percentage",
            maxWidth: 80,
            align: "right",
            Cell: ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">{numeral(value || 0).format('0.00%')}</MDTypography>
            }
        },
        {
            Header: "Amount",
            accessor: "amount",
            maxWidth: 90,
            align: "right",
            dataType: "currency",
            Cell: ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">{numeral(value || 0).format('$0,0')}</MDTypography>
            },
            Footer: info => {
                const total = useMemo(
                    () =>
                        info.rows.reduce((sum, row) => toNumber(row.values["amount"]) + sum, 0),
                    [info.rows]
                )
                return <MDTypography variant="caption" fontWeight="medium" color="dark">{numeral(total).format('$0,0')}</MDTypography>
            },
        }
    ];

    return <MDBox sx={theme => tableAnswerStyles(theme)}>
        <YADataTable
            columns={columns}
            data={rows}
            totalType={"showGrandTotals"}
            vertBorders={false}
        />
    </MDBox>
}

const nodeSummaryStyle = ({ allocatedPercentage }) => ({
    p: 2,
    mb: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    "& .nodeAllocationPercent": {
        position: "relative",
        height: 8,
        width: 200,
        borderRadius: "4px",
        backgroundColor: "#ddd",
        mb: .5
    },
    "& .nodeAllocationPercent::after": {
        content: "''",
        position: "absolute",
        height: 8,
        width: `${(allocatedPercentage || 0) > 100 ? 100 : allocatedPercentage}%`,
        borderRadius: "4px",
        backgroundColor: (allocatedPercentage || 0) > 100 ? "red" : "#1c204d",
    }
});

const NodeInfoDrawer = ({ pinnedNode, edges, onClose }) => {
    const { id, title, amount, allocatedPercentage } = pinnedNode;

    let inboundNodes = edges?.filter(e => e.target === id)?.map(e => ({ name: e.sourceLabel || e.source, amount: e.amount, percentage: toNumber(e.amount / amount) })) || [];
    let outboundNodes = edges?.filter(e => e.source === id)?.map(e => ({ name: e.targetLabel || e.target, amount: e.amount, percentage: toNumber(e.amount / amount) })) || [];

    inboundNodes = _.orderBy(inboundNodes, 'amount', 'desc')
    outboundNodes = _.orderBy(outboundNodes, 'amount', 'desc')

    return (
        <MDBox
            bgColor="white"
            minWidth={400}
            maxWidth={400}
            borderLeft="1px solid #ddd"
            boxShadow="0 8px 16px #1a488e1f!important"
            position="fixed"
            right={0}
            bottom={0}
            top={57}
            zIndex={1075}
        >
            <YAScrollbar>
                <MDBox
                    position="sticky"
                    top={0}
                    zIndex={11}
                    display="flex"
                    px={2.5}
                    height={56}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <MDTypography variant="button" component="span" fontWeight="medium">
                        {title}
                    </MDTypography>
                    <MDButton iconOnly onClick={onClose}>
                        <Icon sx={{ fontSize: "20px!important" }}>close</Icon>
                    </MDButton>
                </MDBox>
                <MDBox>
                    <MDBox
                        pb={3}
                        px={2}
                        height="calc(100vh - 116px)"
                        flex={1}
                        display="flex"
                        flexDirection="column"
                    >
                        <AllocationsTable inbound rows={inboundNodes} />
                        <MDBox sx={() => nodeSummaryStyle({ allocatedPercentage })}>
                            <MDTypography variant="h3" component="span" fontWeight="medium" color={"primary"}>{numeral(amount).format('($0,0)')}</MDTypography>
                            <MDBox className="nodeAllocationPercent"></MDBox>
                            <MDTypography variant="caption" component="span" fontWeight="medium">{`${allocatedPercentage || 0}% Mapped`}</MDTypography>
                        </MDBox>
                        {
                            outboundNodes?.length > 0 && <AllocationsTable rows={outboundNodes} />
                        }
                        {
                            outboundNodes?.length === 0 && <MDBox flex={1}></MDBox>
                        }
                    </MDBox>
                </MDBox>
            </YAScrollbar>
        </MDBox>
    );
}

export default NodeInfoDrawer;