import { memo } from "react";
import { Handle } from "reactflow";
import StartChip from "./StartChip";

const StartChipNode = ({ data, isConnectable }) => {
    return (
        <>
            <StartChip {...data} />
            <Handle
                type="source"
                position={"right"}
                // style={{ zIndex: 1, background: '#555', borderColor: "#555" }}
                style={{ visibility: 'hidden', right: 0 }}
                isConnectable={isConnectable}
            />
        </>
    );
}

export default memo(StartChipNode);