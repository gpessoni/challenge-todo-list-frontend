import React from "react";
import { Button } from "primereact/button";
import { useDrop } from "react-dnd";
import Card from "./Card";

interface CardType {
  id: string;
  title: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
}

interface ListProps {
  title: string;
  cards: any[];
  addCard: (listTitle: string) => void;
  editCard: (card: CardType) => void;
  deleteCard: (card: CardType) => void;
  moveCard: (id: string, newList: string) => void;
}

const ItemTypes = {
  CARD: "card",
};

const List: React.FC<ListProps> = ({
  title,
  cards,
  addCard,
  moveCard,
  editCard,
  deleteCard,
}) => {
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    drop: (item: { id: string }) => moveCard(item.id, title),
  });

  return (
    <div ref={drop} className="list">
      <h2>{title}</h2>
      <Button
        label="Adicionar cartão"
        icon="pi pi-plus"
        className="p-button-sm p-button-outlined"
        onClick={() => addCard(title)}
      />
      {cards.map((card) => (
        <Card
          key={card.id}
          id={card.id}
          title={card.title}
          description={card.description}
          createdAt={card.createdAt}
          status={card.status}
          priority={card.priority}
          moveCard={moveCard}
          editCard={editCard}
          deleteCard={deleteCard}
        />
      ))}
    </div>
  );
};

export default List;
