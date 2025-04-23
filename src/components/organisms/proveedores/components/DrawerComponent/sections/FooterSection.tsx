import React from "react";
import { Button } from "antd";
import { Sparkle } from "phosphor-react";

import "./footerSection.scss";

const FooterSection: React.FC = () => {
  return (
    <div className="footerSection">
      <Button className="iaButton">
        <Sparkle size={14} color="#5b21b6" weight="fill" />
        <span className="textNormal">
          Analizar con{" "}
          <span
            className="cashportIATextGradient"
            style={{
              fontWeight: 500
            }}
          >
            Cashport IA
          </span>
        </span>
      </Button>
    </div>
  );
};

export default FooterSection;
