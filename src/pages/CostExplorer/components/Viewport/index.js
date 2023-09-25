import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
    addEdge,
    Controls,
    Background,
    useNodesState,
    useEdgesState
} from 'reactflow';
import MDBox from "components/MDBox";
import ValueChipNode from "../ValueChipNode";
import StartChipNode from "../StartChipNode";
import 'reactflow/dist/style.css';
import './viewport.css';
import Legend from "../Legend";
import { useCostExplorerContext } from "context/CostExplorerContext";
import { pinNode } from "context/CostExplorerContext";
import { generateNodes, getViewportData } from "../../utils";
import EmptyState from "components/EmptyState";
import new_item_img from 'assets/svg/add_new.svg';
import NodeInfoDrawer from "../NodeInfoDrawer";

const nodeTypes = {
    valueChipNode: ValueChipNode,
    startChipNode: StartChipNode,
};

const ViewportCanvas = ({ data, pinnedNode, onPinNode }) => {

    const canvasRef = useRef();
    // console.log("data", data)

    const [selectedNode, setSelectedNode] = useState();

    const onNodePin = (moveViewportBy, node) => {
        if (canvasRef.current) {
            const currentViewport = canvasRef.current.getViewport();
            if (moveViewportBy)
                canvasRef.current.setViewport({ x: currentViewport.x - moveViewportBy, y: 30, zoom: currentViewport.zoom }, { duration: 300 })
            else
                canvasRef.current.setViewport({ x: currentViewport.x, y: 30, zoom: currentViewport.zoom }, { duration: 300 })
        }
        onPinNode(node);
    };

    const onHoverClick = (nodeid) => {
        setSelectedNode(nodeid);
    };

    const { nodes: nodesArr, edges: edgesArr } = generateNodes(data, onHoverClick, onNodePin);
    const [nodes, setNodes, onNodesChange] = useNodesState(nodesArr);
    const [edges, setEdges, onEdgesChange] = useEdgesState(edgesArr);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    useEffect(() => {
        const { nodes, edges } = generateNodes(data, onHoverClick, onNodePin);
        setNodes(nodes);
        setEdges(edges);
    }, [data, pinnedNode, setNodes, setEdges]);


    const handleOnNodeInfoDrawerClose = (event) => {
        if (event && event.target.localName === 'body') {
            return;
        }
        onPinNode(null);
    };

    // const relatedNodes = pinnedNode ? edges.filter((edge) => {
    //     const { id: pinnedNodeId } = pinnedNode;
    //     return pinnedNodeId === edge.source || edge.target === pinnedNodeId;
    // }).map(edge => {
    //     const { id: pinnedNodeId } = pinnedNode;
    //     if (pinnedNodeId === edge.source)
    //         return edge.target;
    //     return edge.source;
    // }) : [];


    // const nodesWithUpdatedTypes = pinnedNode ? nodes.map(node => {
    //     node.data.relatedNode = (relatedNodes || []).includes(node.id);
    //     return node;
    // }) : nodes;

    const edgesWithUpdatedTypes = edges.map((edge) => {
        if (selectedNode) {
            const { id: selectedNodeId } = selectedNode;
            if (selectedNodeId === edge.source || edge.target === selectedNodeId) {
                edge.labelStyle = { opacity: 1, fill: "#fff", fontWeight: 600 };
                edge.labelShowBg = true;
                edge.animated = false;
                edge.style = { strokeWidth: 4, stroke: "#1c204d" };
            }
            else {
                edge.labelStyle = { opacity: 0 };
                edge.labelShowBg = false;
                edge.animated = false;
                edge.style = { strokeWidth: 4, stroke: "#9b9ba51c" };
            }
        }
        else if (pinnedNode) {
            // const { id: pinnedNodeId, amountComposition } = pinnedNode;
            // // console.log(distributions)
            // const connectedNodes = ["exp", pinnedNodeId, ...amountComposition];
            // if (connectedNodes.includes(edge.source) || connectedNodes.includes(edge.target)) {
            //     edge.labelStyle = { opacity: 1, fill: "#fff", fontWeight: 600 };
            //     edge.labelShowBg = true;
            //     // edge.animated = true;
            //     edge.style = { strokeWidth: 4, stroke: "#1c204d" };
            // }
            // else {
            //     edge.labelStyle = { opacity: 0 };
            //     edge.labelShowBg = false;
            //     edge.animated = false;
            //     edge.style = { strokeWidth: 4, stroke: "#9b9ba51c" };
            // }

            const { id: pinnedNodeId } = pinnedNode;
            if (pinnedNodeId === edge.source || edge.target === pinnedNodeId) {
                edge.labelStyle = { opacity: 1, fill: "#fff", fontWeight: 600 };
                edge.labelShowBg = true;
                edge.animated = false;
                edge.style = { strokeWidth: 4, stroke: "#1c204d" };
            }
            else {
                edge.labelStyle = { opacity: 0 };
                edge.labelShowBg = false;
                edge.animated = false;
                edge.style = { strokeWidth: 4, stroke: "#9b9ba51c" };
            }
        }
        else {
            edge.labelStyle = { opacity: 0 };
            edge.labelShowBg = false;
            edge.animated = false;
            edge.style = { strokeWidth: 4, stroke: "#9b9ba51c" };
        }
        return edge;
    });

    return (
        <MDBox flex={1} className={pinnedNode ? "blurUnselected" : ""}>
            <ReactFlow
                nodes={nodes}
                edges={edgesWithUpdatedTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                defaultEdgeOptions={{
                    interactionWidth: 0,
                    labelBgPadding: [6, 4],
                    style: { strokeWidth: 4, stroke: "#e9e9ef" },
                    labelBgStyle: { fill: '#1c204d' }
                }}
                minZoom={0.1}
                nodeTypes={nodeTypes}
                onInit={flow => {
                    canvasRef.current = flow;
                    flow.zoomTo(.90, { duration: 300 })
                }}
            >
                <Controls showInteractive={false} />
                <Background color="#aaa" gap={16} />
                <Legend />
            </ReactFlow>
            {
                pinnedNode && <NodeInfoDrawer pinnedNode={pinnedNode} edges={edges} onClose={handleOnNodeInfoDrawerClose} />
            }
        </MDBox>
    );
};

const Viewport = ({ error }) => {
    const [state, dispatch] = useCostExplorerContext();
    const { totalExpenditure, masterData, filters, filteredMappingData, headerConfig, pinnedNode } = state;

    const viewportData = useMemo(() => {
        if (totalExpenditure === 0)
            return {
                totalExpenditure
            };

        const vdata = getViewportData(totalExpenditure, masterData, pinnedNode, filteredMappingData, filters, headerConfig.viewLayers);
        return {
            totalExpenditure,
            layers: headerConfig.viewLayers,
            nodes: vdata.nodeGroups,
            edges: vdata.nodeEdges,
            relations: vdata.relations,
            filters
        };

    }, [masterData, filteredMappingData, headerConfig, filters, pinnedNode]);

    if (error) {
        throw new Error("Request failed");
    }

    const onPinNode = (node) => {
        pinNode(dispatch, node);
    };

    if (totalExpenditure === 0)
        return <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
        >
            <EmptyState
                size="large"
                image={new_item_img}
                title={"Spend not loaded for selected month"}
                description="Choose a different month or upload spend data for the current month using the designer screen and kindly check back."
            />
        </MDBox>

    return (
        <>
            <ViewportCanvas data={viewportData} pinnedNode={pinnedNode} onPinNode={onPinNode} />
        </>
    );
};

export default Viewport;