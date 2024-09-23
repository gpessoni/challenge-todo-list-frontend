import { format } from "date-fns";
import "primeicons/primeicons.css";
import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";
import List from "./components/List";
import { api } from "./services/axios";

interface CardType {
  id: string;
  title: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
}

const App: React.FC = () => {
  const toastRef = useRef<Toast>(null);

  const [cards, setCards] = useState<Record<string, CardType[]>>({
    "A Fazer": [],
    "Em Andamento": [],
    Feito: [],
  });

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  const [newCardText, setNewCardText] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardStatus, setNewCardStatus] = useState("");
  const [newCardPriority, setNewCardPriority] = useState("");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardType | null>(null);

  const addCard = (listTitle: string) => {
    setNewCardText("");
    setNewCardDescription("");
    setEditingCard(null);
    setEditDialogVisible(true);
  };

  const showToast = (
    severity:
      | "success"
      | "info"
      | "warn"
      | "error"
      | "secondary"
      | "contrast"
      | undefined,
    summary: string,
    detail: string
  ) => {
    if (toastRef.current) {
      toastRef.current.show({ severity, summary, detail, life: 3000 });
    }
  };

  const moveCard = async (id: string, newList: string) => {
    let cardToMove: CardType | undefined;

    const newCards = Object.keys(cards).reduce((acc, listTitle) => {
      const newListCards = cards[listTitle].filter((card) => {
        if (card.id === id) cardToMove = card;
        return card.id !== id;
      });
      acc[listTitle] = newListCards;
      return acc;
    }, {} as Record<string, CardType[]>);

    if (cardToMove) {
      cardToMove.status =
        newList === "A Fazer"
          ? "pending"
          : newList === "Em Andamento"
          ? "doing"
          : "completed";
      newCards[newList] = [...newCards[newList], cardToMove];

      setCards(newCards);

      try {
        await api.put(`/tasks/${id}`, {
          id,
          status: cardToMove.status,
        });

        showToast("success", "Sucesso", "Card movido com sucesso!");
        fetchCards();
      } catch (error) {
        console.error("Erro ao mover o card:", error);
        setCards(cards);
        showToast("error", "Erro", "Falha ao mover o card.");
      }
    }
  };

  const editCard = (card: CardType) => {
    console.log(card);
    setEditingCard(card);
    setNewCardText(card.title);
    setNewCardDescription(card.description);
    setNewCardStatus(card.status);
    setNewCardPriority(card.priority);
    setEditDialogVisible(true);
  };

  const saveCard = async () => {
    const now = new Date().toISOString();

    if (editingCard) {
      const updatedCard = {
        ...editingCard,
        title: newCardText,
        description: newCardDescription,
        priority: newCardPriority,
        status: newCardStatus,
      };

      try {
        await api.put(`/tasks/${updatedCard.id}`, updatedCard);
        setCards((prev) => {
          const newCards = { ...prev };
          fetchCards();
          return newCards;
        });

        showToast("success", "Sucesso", "Card atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar o card:", error);
        showToast("error", "Erro", "Falha ao atualizar o card.");
      }
    } else {
      const newCard = {
        id: "",
        title: newCardText,
        description: newCardDescription,
        createdAt: now,
        status: newCardStatus,
        priority: newCardPriority,
      };

      try {
        const response = await api.post("/tasks", newCard);
        fetchCards();

        showToast("success", "Sucesso", "Card criado com sucesso!");
      } catch (error) {
        console.error("Erro ao criar o card:", error);
        showToast("error", "Erro", "Falha ao criar o card.");
      }
    }

    setEditDialogVisible(false);
  };

  const handleDeleteConfirm = async () => {
    if (cardToDelete) {
      try {
        await api.delete(`/tasks/${cardToDelete.id}`);

        setCards((prev) => {
          const newCards = { ...prev };
          Object.keys(newCards).forEach((listTitle) => {
            newCards[listTitle] = newCards[listTitle].filter(
              (card) => card.id !== cardToDelete.id
            );
          });
          return newCards;
        });

        showToast("success", "Sucesso", "Card deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar card:", error);
        showToast("error", "Erro", "Falha ao deletar o card.");
      }
    }
    setConfirmVisible(false);
  };

  const deleteCard = (card: CardType) => {
    setCardToDelete(card);
    setConfirmVisible(true);
  };

  const fetchCards = async () => {
    try {
      const response = await api.get("/tasks");
      const tasks = response.data;

      const todoCards = tasks.filter(
        (task: CardType) => task.status === "pending"
      );
      const doingCards = tasks.filter(
        (task: CardType) => task.status === "doing"
      );
      const doneCards = tasks.filter(
        (task: CardType) => task.status === "completed"
      );

      setCards({
        "A Fazer": todoCards,
        "Em Andamento": doingCards,
        Feito: doneCards,
      });
    } catch (error) {
      console.error("Erro ao buscar as tarefas:", error);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <>
      <Toast ref={toastRef} />
      <DndProvider backend={HTML5Backend}>
        <div className="App">
          <div className="board">
            {Object.keys(cards).map((listTitle) => (
              <List
                key={listTitle}
                title={listTitle}
                cards={cards[listTitle]}
                addCard={addCard}
                moveCard={moveCard}
                editCard={editCard}
                deleteCard={deleteCard}
              />
            ))}
          </div>
        </div>

        <Dialog
          header={editingCard ? "Editar Cartão" : "Adicionar Cartão"}
          visible={editDialogVisible}
          onHide={() => setEditDialogVisible(false)}
          footer={
            <Button label="Salvar" icon="pi pi-check" onClick={saveCard} />
          }
          style={{
            width: "400px",
            maxWidth: "100%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <InputText
              value={newCardText}
              onChange={(e) => setNewCardText(e.target.value)}
              className="p-inputtext-sm"
              placeholder="Texto do cartão"
            />
            <InputText
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              className="p-inputtext-sm"
              placeholder="Descrição do cartão"
            />
            <Dropdown
              value={newCardStatus}
              onChange={(e) => setNewCardStatus(e.value)}
              options={[
                { label: "Pendente", value: "pending" },
                { label: "Em andamento", value: "doing" },
                { label: "Concluído", value: "completed" },
              ]}
              placeholder="Status"
              className="p-dropdown-sm"
            />
            <Dropdown
              value={newCardPriority}
              onChange={(e) => setNewCardPriority(e.value)}
              options={[
                { label: "Baixa", value: "low" },
                { label: "Média", value: "medium" },
                { label: "Alta", value: "high" },
              ]}
              placeholder="Prioridade"
              className="p-dropdown-sm"
            />
          </div>
        </Dialog>

        <ConfirmDialog
          visible={confirmVisible}
          onHide={() => setConfirmVisible(false)}
          message={`Tem certeza que deseja deletar o card "${cardToDelete?.description}"?`}
          header="Confirmar Deleção"
          icon="pi pi-exclamation-triangle"
          accept={handleDeleteConfirm}
          reject={() => setConfirmVisible(false)}
        />
      </DndProvider>
    </>
  );
};

export default App;
