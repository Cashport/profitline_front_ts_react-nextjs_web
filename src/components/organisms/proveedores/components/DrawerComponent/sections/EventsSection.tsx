import React from "react";
import { Avatar, Typography, Input, Button, List, Flex } from "antd";
import { Cloud } from "phosphor-react";

const { Text } = Typography;
const { TextArea } = Input;

interface Event {
  avatar: string | null; // URL del avatar o null si no hay imagen
  userName: string; // Nombre del usuario que comentó
  time: string; // Tiempo desde el comentario, como "Hace 5 horas"
  comment: string; // Texto del comentario
}

interface EventsSectionProps {
  events: Event[]; // Lista de eventos
  onAddComment: (comment: string) => void; // Callback para agregar un comentario
}

const EventsSection: React.FC<EventsSectionProps> = ({ events, onAddComment }) => {
  const [newComment, setNewComment] = React.useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment(""); // Limpiar el input después de agregar
    }
  };

  return (
    <Flex vertical gap={20}>
      <Flex gap={8} align="center">
        <Cloud size={16} color="#7B7B7B" />
        <Text
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: "#7B7B7B",
            margin: 0
          }}
        >
          Eventos
        </Text>
      </Flex>
      <Flex gap={8}>
        <TextArea
          rows={2}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Agrega un comentario"
          maxLength={200}
          style={{ border: "none" }}
        />
        <Button
          type="primary"
          onClick={handleAddComment}
          style={{ marginTop: "8px", float: "right" }}
          disabled={!newComment.trim()}
        >
          Enviar
        </Button>
      </Flex>
      <List
        dataSource={events}
        renderItem={(item) => (
          <List.Item style={{ alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <Avatar src={item.avatar || undefined} alt={item.userName}>
                {!item.avatar && item.userName.charAt(0).toUpperCase()}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text strong>{item.userName}</Text>
                <Text type="secondary" style={{ display: "block", fontSize: "12px" }}>
                  {item.time}
                </Text>
                <Text>{item.comment}</Text>
              </div>
            </div>
          </List.Item>
        )}
      />
    </Flex>
  );
};

export default EventsSection;
