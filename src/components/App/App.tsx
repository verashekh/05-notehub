import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import css from './App.module.css';

import NoteList from '../NoteList/NoteList';
import SearchBox from '../SearchBox/SearchBox';
import Pagination from '../Pagination/Pagination';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import NoteForm from '../NoteForm/NoteForm';
import Modal from '../Modal/Modal';
import type { NoteTag } from '../../types/note';
import { fetchNotes } from '../../services/noteService';

export default function App() {
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
  const { data, isLoading, isError, isFetching, error } = useQuery({
    queryKey: ['notes', page, perPage, search, tag, sortBy],
    queryFn: () => fetchNotes({ page, perPage, search, tag, sortBy }),
    placeholderData: keepPreviousData,
  });

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;

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
          <NoteForm onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}

      {isLoading && <Loader />}
      {!isLoading && isFetching && <Loader />}
      {!isLoading && !isError && notes.length === 0 && (
        <p className={css.empty}>No notes found. Try another search</p>
      )}
      {isError && (
        <ErrorMessage
          message={(error as Error)?.message ?? 'Failed to load notes'}
        />
      )}
      {notes.length > 0 && <NoteList notes={notes} />}
    </div>
  );
}
