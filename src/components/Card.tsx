import { Button } from "primereact/button";
import React from "react";
import { useDrag } from "react-dnd";

interface CardProps {
  id: string;
  title: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
  moveCard: (id: string, newList: string) => void;
  editCard: (card: CardType) => void;
  deleteCard: (card: CardType) => void;
}

interface CardType {
  id: string;
  title: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
}

const ItemTypes = {
  CARD: "card",
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "#28a745";
    case "medium":
      return "#ffc107";
    case "high":
      return "#dc3545";
    default:
      return "#6c757d";
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "low":
      return "Baixa";
    case "medium":
      return "Média";
    case "high":
      return "Alta";
    default:
      return "Sem prioridade";
  }
};

const Card: React.FC<CardProps> = ({
  id,
  title,
  description,
  createdAt,
  status,
  priority,
  editCard,
  deleteCard,
}) => {
  const [, ref] = useDrag({
    type: ItemTypes.CARD,
    item: { id },
  });

  return (
    <div ref={ref} className="card">
      <h4>{title}</h4>
      <p>{description}</p>

      <div
        className="priority-badge"
        style={{
          backgroundColor: getPriorityColor(priority),
          color: "white",
          padding: "0.25em 0.5em",
          borderRadius: "0.95em",
          fontWeight: "bold",
          width: "20%",
          fontSize: "0.8em",
          marginLeft: "auto",
          marginTop: "0.5em",
          marginBottom: "0.5em",
          display: "inline-block",
          cursor: "pointer",
        }}
      >
        {getPriorityLabel(priority)}
      </div>

      <div className="card-buttons">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          onClick={(e) => {
            e.stopPropagation();
            editCard({ id, title, description, priority, status, createdAt });
          }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text"
          onClick={(e) => {
            e.stopPropagation();
            deleteCard({ id, title, description, priority, status, createdAt });
          }}
        />
      </div>
    </div>
  );
};

export default Card;
