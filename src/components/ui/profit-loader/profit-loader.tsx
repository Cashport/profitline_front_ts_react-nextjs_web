"use client";
import React, { FC } from "react";
import Image from "next/image";
import { useTranslations } from "use-intl";
import styles from "./profit-loader.module.scss";

interface ProfitLoaderProps {
  size?: "small" | "medium" | "large";
  message?: string;
  className?: string;
}

const ProfitLoader: FC<ProfitLoaderProps> = ({ size = "medium", message, className }) => {
  const tCommon = useTranslations("common");
  const sizeMap = {
    small: 80,
    medium: 120,
    large: 160
  };

  const imageSize = sizeMap[size];

  return (
    <div className={`${styles.loaderContainer} ${className || ""}`}>
      <div className={styles.imageWrapper}>
        <Image
          src="/gifs/Profitline_Motion_Isotipo_Positivo.gif"
          alt={tCommon("status.loading")}
          width={imageSize}
          height={imageSize}
          className={styles.loaderImage}
          unoptimized
        />
      </div>
      {message && <p className={styles.loaderMessage}>{message}</p>}
    </div>
  );
};

export default ProfitLoader;
