"use client";
import React from "react";
import { Flex } from "antd";
import { CaretRight } from "@phosphor-icons/react";

import "./baseCard.scss";

export interface BaseCardProps {
  icon: React.ReactNode;
  iconBackgroundColor?: string;
  iconColor?: string;
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
  amount: string;
  originalAmount?: string;
  amountColor?: string;
  isInteractive?: boolean;
  onClick?: () => void;
  className?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({
  icon,
  iconBackgroundColor = "#d6faff",
  iconColor = "#0066CC",
  title,
  subtitle,
  extra,
  amount,
  originalAmount,
  amountColor,
  isInteractive = false,
  onClick,
  className = ""
}) => {
  return (
    <Flex
      justify="space-between"
      align="center"
      className={`base-card ${className}`}
      onClick={isInteractive ? onClick : undefined}
      style={{ cursor: isInteractive ? "pointer" : "default" }}
    >
      <Flex gap={"0.5rem"} align="center">
        <div
          className="base-card__icon-wrapper"
          style={{
            backgroundColor: iconBackgroundColor,
            color: iconColor
          }}
        >
          {icon}
        </div>

        <Flex vertical gap={"0.125rem"}>
          <p className="base-card__title">{title}</p>
          <p className="base-card__subtitle">{subtitle}</p>
          {extra && <div className="base-card__extra">{extra}</div>}
        </Flex>
      </Flex>

      <Flex align="center" gap={"1rem"}>
        <Flex vertical align="end">
          <p className="base-card__amount" style={{ color: amountColor }}>
            <span className="base-card__currency">$</span> {amount}
          </p>
          {originalAmount && (
            <p className="base-card__original-amount">
              <span className="base-card__currency">$</span> {originalAmount}
            </p>
          )}
        </Flex>

        {isInteractive && <CaretRight className="base-card__caret-icon" size={16} />}
      </Flex>
    </Flex>
  );
};

export default BaseCard;
