import { Tooltip, Typography } from "antd";
import { useState } from "react";

const { Paragraph } = Typography;


const TooltipTrunc = (props) => {
    const [truncated, setTruncated] = useState(false);

    const ellipsis = {
      rows: 1,
      expandable: false,
    }

    const { text } = props;

    return (
        <Tooltip title={truncated ? text : undefined} >
        <Paragraph
          style={{...props.style}}
          ellipsis={{ ...ellipsis, onEllipsis: setTruncated }}
        >
            {/* NOTE: Fragment is necessary to avoid showing the title */}
            <>{text}</>
        </Paragraph>
        </Tooltip>
    );
};

export { TooltipTrunc };