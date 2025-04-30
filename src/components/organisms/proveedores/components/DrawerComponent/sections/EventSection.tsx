import React, { useState } from "react";
import { Cloud, Hourglass } from "phosphor-react";
import { Typography, Avatar, Steps, Button } from "antd";

import { useMessageApi } from "@/context/MessageContext";
import { IconLabel } from "@/components/atoms/IconLabel/IconLabel";

import "./eventsection.scss";

const { Text } = Typography;
const { Step } = Steps;

interface Event {
  approved_by: string | null;
  rejected_by: string | null;
  created_at: string;
  created_by: string;
  comments: string;
  files: any[];
}

interface EventSectionProps {
  events?: Event[];
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getEventUser = (event: Event) => {
    return event.created_by || event.approved_by || event.rejected_by || "Unknown User";
  };

  const getEventAction = (event: Event) => {
    if (event.approved_by) return "Aprobado";
    if (event.rejected_by) return "Rechazado";
    return "Acción desconocida";
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
        {events?.map((event, index) => (
          <Step
            key={index}
            status="finish"
            title={
              <div className="event-content">
                <Text strong>{getEventUser(event)}</Text>
                <Text>{event.comments || getEventAction(event)}</Text>
                <Text type="secondary">{formatDate(event.created_at)}</Text>
              </div>
            }
            icon={
              <div className="approval-avatar">{getEventUser(event).charAt(0).toUpperCase()}</div>
            }
          />
        ))}
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
      </Steps>
    </div>
  );
};
