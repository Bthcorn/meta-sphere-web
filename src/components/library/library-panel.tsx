import { useState } from 'react';
import { BookOpen, Upload, Search, SlidersHorizontal } from 'lucide-react';
import { ZONE_CONFIG } from '@/config/zone-sessions';
import { useLibraryStore } from '@/store/library.store';
import { useLibraryFiles } from '@/hooks/useLibrary';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from '@/components/ui/combobox';
import { FileCard } from './file-card';
import { UploadModal } from './upload-modal';
import { FileViewer } from './file-viewer';
import type { FileCategory } from '@/types/file';

const ROOM_ID = ZONE_CONFIG.zone_library.roomId;

const SORT_OPTIONS: {
  label: string;
  sortBy: 'createdAt' | 'downloadCount' | 'name';
  sortOrder: 'asc' | 'desc';
}[] = [
  { label: 'Newest first', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Oldest first', sortBy: 'createdAt', sortOrder: 'asc' },
  { label: 'Most downloaded', sortBy: 'downloadCount', sortOrder: 'desc' },
  { label: 'A → Z', sortBy: 'name', sortOrder: 'asc' },
];

const CATEGORY_TABS: { label: string; value: FileCategory | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Lectures', value: 'LECTURE_NOTES' },
  { label: 'Exams', value: 'PAST_EXAMS' },
  { label: 'HW', value: 'ASSIGNMENTS' },
  { label: 'Solutions', value: 'SOLUTIONS' },
  { label: 'Resources', value: 'RESOURCE' },
];

export function LibraryPanel() {
  const { filters, setFilter, openUploadModal, uploadProgress, viewerFile } = useLibraryStore();
  const { data: files = [], isLoading } = useLibraryFiles(ROOM_ID);
  const [searchDraft, setSearchDraft] = useState(filters.search ?? '');

  const handleSearch = (value: string) => {
    setSearchDraft(value);
    setFilter('search', value || undefined);
  };

  // Count files per category for the tab badges
  const countByCategory = files.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* Main panel */}
      <div className='pointer-events-auto flex h-full flex-col gap-3'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <BookOpen className='h-4 w-4 text-white/60' />
            <span className='text-sm font-semibold text-white'>Library</span>
            <span className='text-xs text-white/30'>({files.length})</span>
          </div>
          <button
            onClick={openUploadModal}
            className='flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5
                       text-xs font-medium text-white transition-colors hover:bg-blue-500'
          >
            <Upload className='h-3.5 w-3.5' />
            Upload
          </button>
        </div>

        {/* Upload progress bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className='h-1 w-full overflow-hidden rounded-full bg-white/10'>
            <div
              className='h-full rounded-full bg-blue-500 transition-all'
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25' />
          <input
            value={searchDraft}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder='Search files, subjects…'
            className='w-full rounded-lg border border-white/10 bg-white/6 py-2 pl-9 pr-3
                       text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none'
          />
        </div>

        {/* Category tabs */}
        <div className='flex gap-1 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden'>
          {CATEGORY_TABS.map(({ label, value }) => {
            const count = value === '' ? files.length : (countByCategory[value] ?? 0);
            const isActive = (filters.category ?? '') === value;
            return (
              <button
                key={value}
                onClick={() => setFilter('category', value || undefined)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium
                            transition-colors whitespace-nowrap
                            ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/6 text-white/50 hover:bg-white/10 hover:text-white/80'
                            }`}
              >
                {label} {count > 0 && <span className='opacity-60'>({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Sort row */}
        <div className='flex items-center gap-2'>
          <SlidersHorizontal className='h-3.5 w-3.5 text-white/30' />
          <div className='flex-1'>
            <Combobox
              value={
                SORT_OPTIONS.find(
                  (o) =>
                    o.sortBy === (filters.sortBy ?? 'createdAt') &&
                    o.sortOrder === (filters.sortOrder ?? 'desc')
                )?.label ?? ''
              }
              onValueChange={(label) => {
                if (!label) return;
                const opt = SORT_OPTIONS.find((o) => o.label === label);
                if (!opt) return;
                setFilter('sortBy', opt.sortBy);
                setFilter('sortOrder', opt.sortOrder);
              }}
            >
              <ComboboxInput
                readOnly
                showTrigger
                showClear={false}
                className='h-8 rounded-lg border-white/10 bg-white/6 shadow-none
                         focus-within:border-white/20 focus-within:ring-0
                         [&_input]:text-xs [&_input]:text-white/60 [&_input]:placeholder:text-white/30
                         [&_button]:text-white/40 [&_button:hover]:bg-white/10'
              />
              <ComboboxContent className='border border-white/10 bg-black/80 text-white shadow-xl backdrop-blur-md'>
                <ComboboxList>
                  {SORT_OPTIONS.map((opt) => (
                    <ComboboxItem
                      key={opt.label}
                      value={opt.label}
                      className='text-white/70 data-highlighted:bg-white/10 data-highlighted:text-white'
                    >
                      {opt.label}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>

        {/* File grid */}
        <div className='flex-1 overflow-y-auto pr-1'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60' />
            </div>
          ) : files.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 py-12 text-center'>
              <BookOpen className='h-10 w-10 text-white/15' />
              <p className='text-sm text-white/30'>No files yet</p>
              <p className='text-xs text-white/20'>Be the first to upload a resource!</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3'>
              {files.map((file) => (
                <FileCard key={file.id} file={file} roomId={ROOM_ID} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload modal */}
      <UploadModal roomId={ROOM_ID} />

      {/* Viewer popup */}
      {viewerFile && <FileViewer />}
    </>
  );
}
