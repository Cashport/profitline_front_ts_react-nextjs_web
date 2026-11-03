import React from "react";
import { Button } from "antd";
import { Sparkle } from "phosphor-react";
import { useTranslations } from "use-intl";

import "./footerSection.scss";

const FooterSection: React.FC = () => {
  const t = useTranslations("suppliers.ai");
  return (
    <div className="footerSection">
      <Button className="iaButton">
        <Sparkle size={14} color="#5b21b6" weight="fill" />
        <span className="textNormal">
          {t.rich("analyzeWith", {
            ai: (chunks) => (
              <span className="cashportIATextGradient" style={{ fontWeight: 500 }}>
                {chunks}
              </span>
            )
          })}
        </span>
      </Button>
    </div>
  );
};

export default FooterSection;
