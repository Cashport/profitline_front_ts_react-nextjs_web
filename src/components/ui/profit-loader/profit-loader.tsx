import React, { FC } from "react";
import Image from "next/image";
import styles from "./profit-loader.module.scss";

interface ProfitLoaderProps {
  size?: "small" | "medium" | "large";
  message?: string;
  className?: string;
}

const ProfitLoader: FC<ProfitLoaderProps> = ({
  size = "medium",
  message,
  className
}) => {
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
          alt="Loading"
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
