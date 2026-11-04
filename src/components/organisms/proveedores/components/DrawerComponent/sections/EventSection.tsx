import React, { useState } from "react";
import { CheckCircle, Cloud, Sparkle, XCircle } from "phosphor-react";
import { Avatar, Steps, Button, Flex } from "antd";
import { useTranslations } from "use-intl";

import { formatTimeAgo } from "@/utils/utils";
import { useMessageApi } from "@/context/MessageContext";
import { IDocumentEvent } from "@/hooks/useDocument";

import { IconLabel } from "@/components/atoms/IconLabel/IconLabel";
import { createDocumentComment } from "@/services/documents/documents";

import "./eventsection.scss";

const { Step } = Steps;

interface EventSectionProps {
  events?: IDocumentEvent[];
  incidentId?: number;
  currentUserAvatar?: string;
  mutateComments: () => void;
}
export const EventSection: React.FC<EventSectionProps> = ({
  events,
  currentUserAvatar,
  incidentId,
  mutateComments
}) => {
  const t = useTranslations("suppliers.events");
  const tCommon = useTranslations("common");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showMessage } = useMessageApi();

  const getEventUser = (event: IDocumentEvent) => {
    return event.is_ia ? (
      <p className="cashportIATextGradient">CashportIA</p>
    ) : (
      event.username || t("unknownUser")
    );
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      showMessage("error", t("commentRequired"));
      return;
    }

    setIsSubmitting(true);

    if (!incidentId) return showMessage("error", t("commentNoIncident")), setIsSubmitting(false);
    try {
      await createDocumentComment(comment, incidentId);
      showMessage("success", t("commentSuccess"));
      setComment("");
      mutateComments && mutateComments();
    } catch (error) {
      showMessage("error", t("commentError"));
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="event-section-drawerComponent">
      <div className="event-header">
        <IconLabel icon={<Cloud size={14} />} text={t("title")} />
      </div>
      <Steps direction="vertical" size="small" className="event-steps">
        <Step
          status="wait"
          icon={<Avatar src={currentUserAvatar} />}
          title={
            <div className="comment-input-container">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("commentPlaceholder")}
                className="add-comment"
                type="text"
              />
              <Button
                type="primary"
                onClick={handleCommentSubmit}
                loading={isSubmitting}
                disabled={!comment.trim()}
              >
                {tCommon("actions.send")}
              </Button>
            </div>
          }
        />
        {events?.map((event, index) => (
          <Step
            key={index}
            className="event-step"
            status="finish"
            title={
              <Flex align="center" gap={8} justify="space-between">
                <div className="event-content">
                  <Flex gap={8} align="center">
                    <h4 className="username">{getEventUser(event)}</h4>

                    <p className="timeAgoText">
                      {t("timeAgo", { time: formatTimeAgo(event.createdAt) })}
                    </p>
                  </Flex>
                  <p className="commentText">{event.comment}</p>
                </div>
                {event.is_approved !== null ? (
                  event.is_approved ? (
                    <CheckCircle size={24} color="#016630" />
                  ) : (
                    <XCircle size={24} color="#EC003F" />
                  )
                ) : null}
              </Flex>
            }
            icon={
              event.is_ia ? (
                <Avatar
                  style={{ backgroundColor: "#f5efff" }}
                  icon={<Sparkle size={14} weight="fill" color="#5B21B6" />}
                />
              ) : (
                <Avatar src={event.photo} />
              )
            }
          />
        ))}
      </Steps>
    </div>
  );
};
