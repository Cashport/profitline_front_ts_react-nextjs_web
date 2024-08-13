"use client"

import { Flex } from "antd";
import styles from "./DetailsOrdersWrapper.module.scss";
import Wrapper from "@/components/organisms/wrapper/Wrapper";

export default function DetailsOrderWrapper({children}: {children: React.ReactNode}) {
  return (
    <Wrapper>
      <Flex vertical gap={"1.5rem"} className={styles.wrapper}>
        <Flex gap={"2rem"} justify="space-between" wrap="wrap">
          <p className={styles.heading}>
            Resumen de viaje
          </p>
        </Flex>
        {children}
      </Flex>
    </Wrapper>
  )
}

