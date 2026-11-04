import React, { useState } from "react";
import { Hourglass } from "phosphor-react";
import { Typography, Avatar, Steps, Button } from "antd";
import { useTranslations } from "use-intl";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import "./eventsection.scss";
import { IconLabel } from "@/components/atoms/IconLabel/IconLabel";
import { addIncidentComment } from "@/services/resolveNovelty/resolveNovelty";
import { MessageInstance } from "antd/es/message/interface";

const { Text } = Typography;
const { Step } = Steps;

interface Event {
  approved_by: string | null;
  rejected_by: string | null;
  created_at: string;
  created_by: string;
  comments: string;
  files: any[]; // You might want to define a more specific type for files
}

interface EventSectionProps {
  events: Event[];
  incidentId?: string;
  currentUserAvatar: string;
  mutate: () => void;
  messageApi: MessageInstance;
}
export const EventSection: React.FC<EventSectionProps> = ({
  events,
  currentUserAvatar,
  incidentId,
  mutate,
  messageApi
}) => {
  const t = useTranslations("modals.noveltyDetail.events");
  const tCommon = useTranslations("common");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getEventUser = (event: Event) => {
    return event.created_by || event.approved_by || event.rejected_by || t("unknownUser");
  };

  const getEventAction = (event: Event) => {
    if (event.approved_by) return tCommon("status.approved");
    if (event.rejected_by) return tCommon("status.rejected");
    return t("unknownAction");
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      messageApi.error(t("commentRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      await addIncidentComment(incidentId || "1", { comments: comment });
      messageApi.success(t("commentAdded"));
      setComment("");
      mutate();
    } catch (error) {
      messageApi.error(t("commentError"));
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="event-section">
      <div className="event-header">
        <IconLabel icon={<Hourglass size={20} />} text={t("title")} />
      </div>
      <Steps direction="vertical" size="small" className="event-steps">
        {events.map((event, index) => (
          <Step
            key={index}
            status="finish"
            title={
              <div className="event-content">
                <Text strong>{getEventUser(event)}</Text>
                {event.comments ? (
                  <div className="event-comment-markdown">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                      {event.comments}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <Text>{getEventAction(event)}</Text>
                )}
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
      </Steps>
    </div>
  );
};
