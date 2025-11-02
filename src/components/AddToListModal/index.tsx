'use client';

import React, { useState } from 'react';
import { useInteractions } from '@/contexts/InteractionsContext';
import { useAuth } from '@/contexts/AuthContext';
import './index.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  posterPath?: string;
}

export default function AddToListModal({
  isOpen,
  onClose,
  mediaId,
  mediaType,
  mediaTitle,
  posterPath,
}: Props) {
  const { getAllLists, addToList, createList, isInList } = useInteractions();
  const { isAuthenticated } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen || !isAuthenticated) return null;

  const lists = getAllLists() || [];

  const handleAddToList = (listId: string, listName: string) => {
    if (isInList(listId, mediaId, mediaType)) {
      setNotification('Já está nesta lista!');
    } else {
      addToList(listId, mediaId, mediaType, mediaTitle, posterPath);
      setNotification(`Adicionado a "${listName}"!`);
    }
    
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;

    const newList = createList(newListName, newListDescription || undefined, true);
    addToList(newList.id, mediaId, mediaType, mediaTitle, posterPath);
    
    setNotification(`Lista "${newListName}" criada e filme adicionado!`);
    setNewListName('');
    setNewListDescription('');
    setShowCreateForm(false);
    
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="add-to-list-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-to-list-modal">
        <div className="modal-header">
          <h2>Adicionar a uma lista</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {notification && (
            <div className="notification success">
              {notification}
            </div>
          )}

          {lists.length === 0 && !showCreateForm ? (
            <div className="empty-state">
              <p>Você ainda não criou nenhuma lista.</p>
              <button
                className="btn-create-list"
                onClick={() => setShowCreateForm(true)}
              >
                Criar primeira lista
              </button>
            </div>
          ) : (
            <>
              {!showCreateForm ? (
                <>
                  <div className="lists-container">
                    {lists.map((list) => (
                      <div key={list.id} className="list-item">
                        <div className="list-info">
                          <h3>{list.name}</h3>
                          {list.description && (
                            <p className="list-description">{list.description}</p>
                          )}
                          <span className="list-count">
                            {list.movies.length} {list.movies.length === 1 ? 'filme' : 'filmes'}
                          </span>
                        </div>
                        <button
                          className={`btn-add ${isInList(list.id, mediaId, mediaType) ? 'added' : ''}`}
                          onClick={() => handleAddToList(list.id, list.name)}
                          disabled={isInList(list.id, mediaId, mediaType)}
                        >
                          {isInList(list.id, mediaId, mediaType) ? '✓ Adicionado' : '+ Adicionar'}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn-new-list"
                    onClick={() => setShowCreateForm(true)}
                  >
                    + Nova lista
                  </button>
                </>
              ) : (
                <div className="create-list-form">
                  <input
                    type="text"
                    placeholder="Nome da lista"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    maxLength={50}
                  />
                  <textarea
                    placeholder="Descrição (opcional)"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                  <div className="form-actions">
                    <button
                      className="btn-cancel"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewListName('');
                        setNewListDescription('');
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn-submit"
                      onClick={handleCreateList}
                      disabled={!newListName.trim()}
                    >
                      Criar e adicionar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
