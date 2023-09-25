import { memo } from "react";
import { Handle } from "reactflow";
import ValueChip from "./ValueChip";

const ValueChipNode = ({ data, isConnectable }) => {
    return (
        <>
            <Handle
                type="target"
                position={"left"}
                // style={{ zIndex: 1, background: "#fff", border: '1px solid #555' }}
                style={{ visibility: 'hidden', left: 0 }}
                isConnectable={isConnectable}
            />
            <ValueChip {...data} />
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

export default memo(ValueChipNode);