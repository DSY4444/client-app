import { Icon } from "@mui/material";
import _ from "lodash";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { toInt } from "utils";
import numeral from "numeral";
import FilterSelector from "./components/FilterSelector";
import { toNumber } from "utils";

const getSolutionToTowerEdges = (mappingDataset, filters, groupByNodePropName, groupByEdgePropName) => {
    let edges = [];

    const amountPropName = "amount";

    const data = filters[groupByNodePropName]?.length > 0 ? mappingDataset.filter(r => r.allocationType === 1 && filters[groupByNodePropName].includes(r[groupByNodePropName])) : mappingDataset.filter(r => r.allocationType === 1);
    if (groupByEdgePropName) {
        const groupedDataEdges = _.groupBy(data, (item) => {
            return [`${item[groupByNodePropName] || "null"}__${item[groupByEdgePropName] || "null"}`]
        });

        if (Object.keys(groupedDataEdges)?.length > 0)
            edges = Object.keys(groupedDataEdges)?.map((k) => {
                const totalAmount = _.sumBy(groupedDataEdges[k], amountPropName);
                const keys = k.split("__");
                return {
                    [groupByNodePropName]: keys[0],
                    [groupByEdgePropName]: keys[1] === "null" ? null : keys[1],
                    ["amount"]: totalAmount || 0,
                }
            });
    }

    return edges;
};

const getData1 = (mappingDataset, filters, groupByNodePropName, groupByEdgePropName, edgeAmountPropName) => {
    let nodes = [], edges = [];
    const amountPropName = "amount";
    const groupByEdgeAmountPropName = edgeAmountPropName || amountPropName;

    const data = filters[groupByNodePropName]?.length > 0 ? mappingDataset.filter(r => filters[groupByNodePropName].includes(r[groupByNodePropName])) : mappingDataset;

    const groupedDataNodes = _.groupBy(data, (item) => {
        return [item[groupByNodePropName] || "null"]
    });

    if (Object.keys(groupedDataNodes)?.length > 0)
        nodes = Object.keys(groupedDataNodes)?.map((k) => {
            const totalAmount = _.sumBy(groupedDataNodes[k], amountPropName);
            return {
                [groupByNodePropName]: k,
                ["amount"]: totalAmount || 0,
            }
        });

    if (groupByEdgePropName) {
        const groupedDataEdges = _.groupBy(data, (item) => {
            return [`${item[groupByNodePropName] || "null"}__${item[groupByEdgePropName] || "null"}`]
        });

        if (Object.keys(groupedDataEdges)?.length > 0)
            edges = Object.keys(groupedDataEdges)?.map((k) => {
                const totalAmount = _.sumBy(groupedDataEdges[k], groupByEdgeAmountPropName);
                const keys = k.split("__");
                return {
                    [groupByNodePropName]: keys[0],
                    [groupByEdgePropName]: keys[1] === "null" ? null : keys[1],
                    ["amount"]: totalAmount || 0,
                }
            });
    }

    return { nodes, edges };
};

export const getViewportData = (totalExpenditure, masterData, pinnedNode, mappingData, filters, viewLayers) => {
    let nodeGroups = [
        [{ id: "exp", name: "Total Spend", amount: totalExpenditure }]
    ];
    let nodeNames = { "exp": "Total Spend" };
    let nodeEdges = [];
    let relations = {};
    const layers = viewLayers?.filter(l => l.isSelected);
    if (mappingData && masterData && layers) {
        for (let index = 0; index < layers.length; index++) {
            const prevLayer = index === 0 ? null : layers[index - 1];
            const prevPrevLayer = index < 2 ? null : layers[index - 2];
            const layer = layers[index];
            const prevLayerMappingId = layer.prevLayerMappingId || prevLayer?.mappingId;
            const { nodes, edges } = getData1(mappingData[layer.mappingDataset], filters, layer.mappingId, prevLayerMappingId, layer.edgeAmountPropName);
            let relationsData = layer.relationsDataset ? mappingData[layer.relationsDataset] || [] : [];

            const nodeArray = [];
            nodes?.forEach((item) => {
                let nodeModel = layer.dataset ?
                    masterData[layer.dataset]?.find(c => String(c.id) === item[layer.mappingId])
                    : { name: _.startCase(item[layer.mappingId]) };

                if (layer.mappingId === "vendorId" && !nodeModel) {
                    nodeModel = { name: "Others", id: null };
                }

                if (nodeModel) {
                    const nodeId = `${layer.mappingId}_${item[layer.mappingId] || "null"}`;

                    nodeNames[nodeId] = nodeModel.name;

                    nodeArray.push({
                        "id": nodeId,
                        "name": nodeModel.name,
                        "key": item[layer.mappingId],
                        "amount": item.amount,
                    });

                    if (index === 0)
                        nodeEdges.push({
                            id: `exp_${layer.mappingId}_${item[layer.mappingId] || "null"}`,
                            deletable: false,
                            selectable: false,
                            sourceLabel: nodeNames["exp"],
                            source: 'exp',
                            targetLabel: nodeModel.name,
                            target: nodeId,
                            amount: item.amount,
                            label: numeral(item.amount).format('($0.00a)'),
                            data: { amount: item.amount }
                        })
                }
            });

            if (index > 0)
                edges?.forEach((item) => {
                    if (item[prevLayerMappingId] && item[layer.mappingId]) {
                        const source = `${prevLayerMappingId}_${item[prevLayerMappingId] || "null"}`;
                        const target = `${layer.mappingId}_${item[layer.mappingId] || "null"}`;
                        if (toNumber(item.amount) > 0)
                            nodeEdges.push({
                                id: `${source}_${target}`,
                                deletable: false,
                                selectable: false,
                                sourceLabel: nodeNames[source],
                                source,
                                targetLabel: nodeNames[target],
                                target,
                                amount: item.amount,
                                label: numeral(item.amount).format('($0.00a)'),
                                data: { amount: item.amount }
                            });
                    }
                });

            nodeGroups.push(nodeArray);

            if (relationsData?.length > 0) {
                relations[layer.id] = relationsData;

                relationsData?.forEach((item) => {
                    if (item['fromAsset'] && item['toAsset'] && !item['derivedUploadedFileId']) {
                        const source = `asset_${item['fromAsset']}`;
                        const target = `asset_${item['toAsset']}`;
                        const amountVal = _.sumBy(_.filter(relationsData, function(o) { return o.toAsset === item['fromAsset'] && o.derivedUploadedFileId !== null }), 'amount') + toNumber(item.amount);
                        const amountVal1 = _.sumBy(_.filter(relationsData, function(o) { return o.toAsset === item['fromAsset'] && o.derivedUploadedFileId === null }), 'amount') + toNumber(item.amount);
                        if ((toNumber(amountVal) > 0) || (toNumber(amountVal1) > 0))
                            nodeEdges.push({
                                id: `${source}_${target}`,
                                deletable: false,
                                selectable: false,
                                sourceLabel: nodeNames[source],
                                source,
                                targetLabel: nodeNames[target],
                                target,
                                amount: amountVal === 0 ? amountVal1 : amountVal,
                                label: numeral(amountVal === 0 ? amountVal1 : amountVal).format('($0.00a)'),
                                data: { amount: amountVal === 0 ? amountVal1 : amountVal }
                            });
                    }
                });
            }

            if (prevPrevLayer && layer.mappingDataset === "solutionOfferingMappings" && prevLayer?.mappingDataset === "assetMappings") {
                const solutionToTowerEdges = getSolutionToTowerEdges(mappingData[layer.mappingDataset], filters, layer.mappingId, prevPrevLayer.mappingId);
                solutionToTowerEdges?.forEach((item) => {
                    if (item[prevPrevLayer.mappingId] && item[layer.mappingId]) {
                        const source = `${prevPrevLayer.mappingId}_${item[prevPrevLayer.mappingId] || "null"}`;
                        const target = `${layer.mappingId}_${item[layer.mappingId] || "null"}`;
                        if (toNumber(item.amount) > 0)
                            nodeEdges.push({
                                id: `${source}_${target}`,
                                deletable: false,
                                selectable: false,
                                sourceLabel: nodeNames[source],
                                source,
                                targetLabel: nodeNames[target],
                                target,
                                amount: item.amount,
                                label: numeral(item.amount).format('($0.00a)'),
                                data: { amount: item.amount }
                            });
                    }
                });
            }
        }
    }


    const relatedNodes = pinnedNode ? nodeEdges.filter((edge) => {
        const { id: pinnedNodeId } = pinnedNode;
        return pinnedNodeId === edge.source || edge.target === pinnedNodeId;
    }).map(edge => {
        const { id: pinnedNodeId } = pinnedNode;
        if (pinnedNodeId === edge.source)
            return edge.target;
        return edge.source;
    }) : [];

    nodeGroups?.forEach((nodeGroup) => {
        nodeGroup?.forEach((node) => {
            const outgoingEdges = nodeEdges.filter((nodeEdge) => nodeEdge.source === node.id);
            const allocatedAmount = toInt(_.sumBy(outgoingEdges, (o) => o?.data?.amount || 0));
            // node["allocatedAmount"] = allocatedAmount || 0;
            node["overAllocated"] = allocatedAmount > toInt(node.amount);
            node["allocatedPercentage"] = toInt((100 * allocatedAmount) / toInt(node.amount));
            node["relatedNode"] = (relatedNodes || []).includes(node.id);
            node["pinnedNodeId"] = pinnedNode?.id;
            node["pinned"] = pinnedNode?.id === node.id;
            // console.log(node.name, allocatedAmount, node)
        });
    });

    return { nodeGroups, nodeEdges, relations };

};

export const getAssetLayersFromRelations = (filteredNodes, relationsData) => {

    const assets = new Set(relationsData.flatMap(obj => [obj.fromAsset, obj.toAsset]));
    let assetLayers = [];
    const firstLayer = []
    assets.forEach(element => {
        const hasRelation = relationsData.find(o => o.toAsset === element)
        if (!hasRelation && !firstLayer.includes(element)) {
            firstLayer.push(element);
        }
    });
    assetLayers.push(firstLayer);

    const lastLayer = [];
    assets.forEach(element => {
        const hasRelation = relationsData.find(o => o.fromAsset === element)
        if (!hasRelation && !lastLayer.includes(element)) {
            lastLayer.push(element);
        }
    });

    assetLayers = getAssetLayers(assets, relationsData, lastLayer, assetLayers);

    //push all un relational assets to 1st layer
    const unRelatedAssets = filteredNodes.map(n => n.key).filter(n => !assets.has(n)) || [];
    assetLayers[0].push(...unRelatedAssets);

    return assetLayers;
};

export const getAssetLayers = (assets, relationsData, lastLayer, assetLayersVal) => {
    let assetLayers = [].concat(assetLayersVal).concat([[]]);

    assets.forEach(element => {
        if (!assetLayers[assetLayers.length - 2].includes(element) && !lastLayer.includes(element)) {
            //get element
            const hasRelationWithPrevious = relationsData.find(o => o.toAsset === element && assetLayers[assetLayers.length - 2].includes(o.fromAsset));
            //create a new layer
            if (hasRelationWithPrevious && !assetLayers[assetLayers.length - 1].includes(element))
                assetLayers[assetLayers.length - 1].push(element);
        }
    });

    const processedAssets = new Set((assetLayers.flatMap(obj => obj) || []).concat(lastLayer));
    if (assets.size === processedAssets.size)
        assetLayers.push(lastLayer);
    else
        assetLayers = getAssetLayers(assets, relationsData, lastLayer, assetLayers);

    return assetLayers;
};

const PADDING = 20;
const NODE_WIDTH = 130;
const NODE_HEIGHT = 80;
const NODE_WIDTH_GAP = (NODE_WIDTH * 2);
const NODE_HEIGHT_GAP = NODE_HEIGHT + PADDING;
const EMPTY_GROUP_HEIGHT = 500;

export const generateNodes = (data, onHover, onPin) => {

    if (!data)
        return { nodes: [], edges: [] };

    const layers = data.layers?.filter(l => l.isSelected);
    let nodes = [];
    let x = 250, y = 0, xExtra = 0;

    Object.keys(data.nodes).forEach((k, ki) => {
        let nodeGroup = data.nodes[k];
        nodeGroup = _.orderBy(nodeGroup, ['pinned', 'relatedNode', 'amount'], ['desc', 'desc', 'desc'])

        if (ki > 0) {
            const layer = layers[ki - 1];
            let relationsData = (data.relations ?? {})[layer.id];
            // const filteredIds = data.filters?.[layer.title] || [];

            const filteredNodes = nodeGroup//.filter(n => n.amount > 0);

            let assetLayers = [];
            // let assetLayerMap = {};

            if (filteredNodes?.length === 0) {
                nodes.push({
                    id: k,
                    type: 'group',
                    deletable: false,
                    // selectable: false,
                    data: { label: null, },
                    position: { x, y: y + 30 },
                    style: {
                        width: NODE_WIDTH + (PADDING * 2),
                        height: EMPTY_GROUP_HEIGHT,
                        background: 'none',
                        border: '1px dashed #ddd'
                    }
                });
                // empty state
                nodes.push({
                    id: `${k}_e`,
                    type: 'default',
                    data: {
                        label: (
                            <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                <Icon color="text" fontSize="large" sx={{ color: "#6d728c" }}>mediation</Icon>
                                <MDTypography mt={1} variant="subTitle2" color="text">No Mappings Found</MDTypography>
                            </MDBox>
                        ),
                    },
                    deletable: false,
                    draggable: false,
                    selectable: false,
                    position: { x: 10, y: 180 },
                    parentNode: k,
                    extent: 'parent',
                    className: 'annotation',
                });
            }
            else {
                assetLayers = relationsData ? getAssetLayersFromRelations(filteredNodes, relationsData) : [];
                assetLayers = assetLayers?.filter(l => l?.length > 0);
                let groupWidth = NODE_WIDTH + (PADDING * 2);
                let groupHeight = ((filteredNodes?.length || 1) * NODE_HEIGHT_GAP) + PADDING;
                if (assetLayers.length > 0) {
                    groupWidth = (NODE_WIDTH_GAP * assetLayers.length) - 90;
                    if (assetLayers.length > 1) {
                        const maxLayerNodes = Math.max(...(assetLayers.map(l => l.length))) || 1;
                        groupHeight = ((maxLayerNodes + 1) * NODE_HEIGHT_GAP) + PADDING;
                    }
                    xExtra = ((NODE_WIDTH_GAP * assetLayers.length) - 90) - (NODE_WIDTH + (PADDING * 2));
                }

                nodes.push({
                    id: k,
                    type: 'group',
                    deletable: false,
                    // selectable: false,
                    data: { label: null },
                    position: { x, y: y + 30 },
                    style: {
                        width: groupWidth,
                        height: groupHeight,
                        background: 'none',
                        border: '1px dashed #ddd'
                    }
                });
            }

            //group header
            nodes.push({
                id: `${k}_h`,
                type: 'default',
                data: {
                    label: <FilterSelector title={layer.title} name={layer.mappingId} hideFilter={filteredNodes?.length === 0} />
                },
                deletable: false,
                draggable: false,
                selectable: false,
                position: { x: 0, y: -40 },
                parentNode: k,
                extent: 'parent',
                className: 'header',
            });

            if (assetLayers.length > 0) {
                let xPos = 38;
                assetLayers.forEach((l, li) => {
                    const filteredAssetNodes = filteredNodes.filter(n => l.includes(n.key));
                    if (filteredAssetNodes?.length > 0) {
                        filteredAssetNodes?.forEach((n, ni) => {
                            if (li > 0)
                                xPos = 38 + (NODE_WIDTH_GAP * li);

                            nodes.push({
                                id: n.id || `${k}_${ni}`,
                                type: 'valueChipNode',
                                deletable: false,
                                data: {
                                    id: n.id,
                                    pinned: n.pinned,
                                    pinnedNodeId: n.pinnedNodeId,
                                    amount: n.amount,
                                    allocatedPercentage: n.allocatedPercentage,
                                    overAllocated: n.overAllocated,
                                    relatedNode: n.relatedNode,
                                    title: n.name,
                                    onHover,
                                    onPin,
                                },
                                position: { x: xPos, y: y + PADDING },
                                parentNode: k,
                                extent: 'parent',
                                draggable: true
                            });
                            y = y + NODE_HEIGHT_GAP;
                        });
                        y = li % 2 === 1 ? 0 : NODE_HEIGHT_GAP / 2;
                        xPos = 38;
                    }
                });
            }
            else {
                filteredNodes?.map((n, ni) => {
                    nodes.push({
                        id: n.id || `${k}_${ni}`,
                        type: 'valueChipNode',
                        deletable: false,
                        data: {
                            id: n.id,
                            pinned: n.pinned,
                            pinnedNodeId: n.pinnedNodeId,
                            amount: n.amount,
                            allocatedPercentage: n.allocatedPercentage,
                            overAllocated: n.overAllocated,
                            relatedNode: n.relatedNode,
                            title: n.name,
                            onHover,
                            onPin,
                        },
                        position: { x: 38, y: y + PADDING },
                        parentNode: k,
                        extent: 'parent',
                        draggable: false
                    });
                    y = y + NODE_HEIGHT_GAP;
                });
            }
        }
        else
            nodeGroup?.map((n, ni) => {
                nodes.push({
                    id: n.id || `${k}_${ni}`,
                    type: 'startChipNode',
                    deletable: false,
                    data: {
                        id: n.id,
                        pinned: n.pinned,
                        pinnedNodeId: n.pinnedNodeId,
                        amount: n.amount,
                        allocatedPercentage: n.allocatedPercentage,
                        overAllocated: n.overAllocated,
                        relatedNode: n.relatedNode,
                        title: n.name,
                        onHover,
                        onPin,
                    },
                    position: { x: x - 100, y: y + 150 },
                });
                //help text
                nodes.push({
                    id: 'helpText',
                    type: 'default',
                    className: 'helpText',
                    data: {
                        label: (
                            <>
                                Click and drag to move the canvas<br />
                                Scroll to zoom the canvas
                            </>
                        ),
                    },
                    deletable: false,
                    draggable: false,
                    selectable: false,
                    position: { x: x - 120, y: 450 },
                });

                y = y + NODE_HEIGHT_GAP;
            });

        y = 0;
        x = x + NODE_WIDTH_GAP + xExtra;
        xExtra = 0;
    });

    return { nodes, edges: data.edges || [] };
};
