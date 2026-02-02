import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import css from './App.module.css';

import NoteList from '../NoteList/NoteList';
import SearchBox from '../SearchBox/SearchBox';
import Pagination from '../Pagination/Pagination';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import NoteForm from '../NoteForm/NoteForm';
import Modal from '../Modal/Modal';
import type { NoteTag } from '../../types/note';
import { fetchNotes, deleteNote, createNote } from '../../services/noteService';
import type { CreateNotePayload } from '../../services/noteService';

export default function App() {
  const queryClient = useQueryClient();

  // modal state ТУТ
  const [isModalOpen, setIsModalOpen] = useState(false);
  // параметри
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [tag] = useState<NoteTag | undefined>(undefined);
  const [sortBy] = useState<'created' | 'updated'>('created');

  // 1) пошук, що в інпуті
  const [searchInput, setSearchInput] = useState('');

  // 2) що йде в запит
  const [search, setSearch] = useState('');

  // debounce в App ✅
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value.trim());
    setPage(1);
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  // 1) Завантаження нотаток
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['notes', page, perPage, search, tag, sortBy],
    queryFn: () => fetchNotes({ page, perPage, search, tag, sortBy }),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      // 1) оновити список
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      // 2) закрити модалку
      setIsModalOpen(false);
    },
  });
  const handleCreate = (payload: CreateNotePayload) => {
    createMutation.mutate(payload);
  };

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;

  // 2) Видалення нотатки
  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
  const handleDelete = (id: string) => deleteMutation.mutate(id);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchInput} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {/* ✅ модалку краще рендерити поза header (але можна і там) */}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreate}
            isSubmitting={createMutation.isPending}
          />
        </Modal>
      )}
      {createMutation.isError && (
        <ErrorMessage message="Failed to create note" />
      )}

      {isLoading && <Loader />}
      {!isLoading && isFetching && <Loader />}
      {isError && <ErrorMessage />}

      {notes.length > 0 && <NoteList notes={notes} onDelete={handleDelete} />}
    </div>
  );
}
