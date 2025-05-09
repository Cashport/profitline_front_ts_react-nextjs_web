import React, { useState } from "react";
import { Cloud } from "phosphor-react";
import { Avatar, Steps, Button, Flex } from "antd";

import { formatTimeAgo } from "@/utils/utils";
import { useMessageApi } from "@/context/MessageContext";
import { IDocumentEvent } from "@/hooks/useDocument";

import { IconLabel } from "@/components/atoms/IconLabel/IconLabel";

import "./eventsection.scss";

const { Step } = Steps;

interface EventSectionProps {
  events?: IDocumentEvent[];
  incidentId?: string;
  currentUserAvatar?: string;
  mutate?: () => void;
}
export const EventSection: React.FC<EventSectionProps> = ({
  events,
  currentUserAvatar,
  incidentId,
  mutate
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showMessage } = useMessageApi();

  const getEventUser = (event: IDocumentEvent) => {
    return event.username || "Unknown User";
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      showMessage("error", "Por favor, ingrese un comentario");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(incidentId || "1", { comments: comment });
      showMessage("success", "Comentario agregado exitosamente");
      setComment("");
      mutate && mutate();
    } catch (error) {
      showMessage("error", "Error al agregar el comentario");
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="event-section-drawerComponent">
      <div className="event-header">
        <IconLabel icon={<Cloud size={14} />} text={`Eventos`} />
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
                placeholder="Agrega un comentario"
                className="add-comment"
                type="text"
              />
              <Button
                type="primary"
                onClick={handleCommentSubmit}
                loading={isSubmitting}
                disabled={!comment.trim()}
              >
                Enviar
              </Button>
            </div>
          }
        />
        {events?.map((event, index) => (
          <Step
            key={index}
            status="finish"
            title={
              <div className="event-content">
                <Flex gap={8} align="center">
                  <h4 className="username">{getEventUser(event)}</h4>

                  <p className="timeAgoText">Hace {formatTimeAgo(event.createdAt)}</p>
                </Flex>
                <p className="commentText">{event.comment}</p>
              </div>
            }
            icon={<Avatar src={event.photo} />}
          />
        ))}
      </Steps>
    </div>
  );
};
