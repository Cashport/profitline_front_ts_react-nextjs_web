import { useTranslations } from "use-intl";

import styles from "./infoCardLogin.module.scss";

export const InfoCardLogin = () => {
  const t = useTranslations("auth.infoCard");
  return (
    <div className={styles.companySection}>
      {/* TOP LINE SVG */}
      <svg
        className={styles.topLine}
        width="170"
        height="143"
        viewBox="0 0 170 143"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M168 0C168 18.5164 163.655 36.8515 155.212 53.9584C146.769 71.0653 134.394 86.609 118.794 99.702C103.194 112.795 84.6735 123.181 64.2908 130.267C43.9081 137.353 22.0621 141 0 141"
          stroke="url(#paint0_linear_9278_74734)"
          strokeWidth="4"
        />
        <defs>
          <linearGradient
            id="paint0_linear_9278_74734"
            x1="168"
            y1="27.4513"
            x2="31.2586"
            y2="164.731"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#DDDDDD" stopOpacity="0" />
            <stop offset="1" stopColor="#CBE71E" />
          </linearGradient>
        </defs>
      </svg>

      <h1 className={styles.main_title}>{t("title")}</h1>

      <h2 className={styles.subTitle}>
        {t.rich("subtitle", { b: (chunks) => <strong>{chunks}</strong> })}
      </h2>

      {/* BOTTOM LINE SVG */}
      <svg
        className={styles.bottomLine}
        width="254"
        height="120"
        viewBox="0 0 254 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.99999 120C1.99999 104.504 8.51815 89.1598 21.1823 74.8433C33.8465 60.5269 52.4087 47.5187 75.8091 36.5614C99.2095 25.6041 126.99 16.9123 157.564 10.9822C188.138 5.05217 220.907 2.00001 254 2.00002"
          stroke="url(#paint0_linear_9278_74735)"
          strokeWidth="4"
        />
        <defs>
          <linearGradient
            id="paint0_linear_9278_74735"
            x1="2"
            y1="97.0265"
            x2="99.1795"
            y2="-77.8417"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#DDDDDD" stopOpacity="0" />
            <stop offset="1" stopColor="#CBE71E" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
