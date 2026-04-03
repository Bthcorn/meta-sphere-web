import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, FileText, FileIcon, Loader2 } from 'lucide-react';
import { useLibraryStore } from '@/store/library.store';
import { useUploadLibraryFile } from '@/hooks/useLibrary';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from '@/components/ui/combobox';
import type { FileCategory } from '@/types/file';

const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'LECTURE_NOTES', label: 'Lecture Notes' },
  { value: 'PAST_EXAMS', label: 'Past Exams' },
  { value: 'ASSIGNMENTS', label: 'Assignments' },
  { value: 'SOLUTIONS', label: 'Solutions' },
  { value: 'CHEAT_SHEETS', label: 'Cheat Sheets' },
  { value: 'TUTORIAL', label: 'Tutorial' },
  { value: 'RESOURCE', label: 'Resource' },
  { value: 'MISC', label: 'Misc' },
];

const YEAR_OPTIONS: { value: string; label: string }[] = [
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
  { value: '4', label: 'Year 4' },
];
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const schema = z.object({
  description: z.string().max(500).optional(),
  category: z.string().optional(),
  subject: z.string().max(255).optional(),
  yearLevel: z.coerce.number().min(1).max(4).optional().or(z.literal('')),
  tags: z.string().optional(), // comma-separated, parsed before submit
  isPublic: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  roomId: string;
}

export function UploadModal({ roomId }: Props) {
  const { uploadModalOpen, closeUploadModal, uploadProgress } = useLibraryStore();
  const uploadMutation = useUploadLibraryFile(roomId);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<
    FormValues,
    unknown,
    FormValues
  >({
    resolver: zodResolver(schema),
    defaultValues: { isPublic: true },
  });

  const categoryValue = watch('category') ?? '';
  const yearLevelValue = String(watch('yearLevel') ?? '');

  if (!uploadModalOpen) return null;

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only PDF and DOCX files are allowed');
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError('File must be under 15 MB');
      return;
    }
    setSelectedFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const onSubmit = (values: FormValues) => {
    if (!selectedFile) return;
    const tags = values.tags
      ? values.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    uploadMutation.mutate({
      file: selectedFile,
      dto: {
        description: values.description,
        category: values.category as FileCategory | undefined,
        subject: values.subject,
        yearLevel: values.yearLevel ? Number(values.yearLevel) : undefined,
        tags,
        isPublic: values.isPublic ?? true,
      },
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileError(null);
    reset();
    closeUploadModal();
  };

  const isPdf = selectedFile?.type === 'application/pdf';

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'>
      <div className='relative w-full max-w-md rounded-2xl border border-white/10 bg-black/75 p-6 shadow-2xl backdrop-blur-md'>
        {/* Header */}
        <div className='mb-5 flex items-center justify-between'>
          <h2 className='text-base font-semibold text-white'>Upload to Library</h2>
          <button
            onClick={handleClose}
            className='rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          {/* Drop zone */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2
                          border-dashed py-8 transition-colors
                          ${
                            dragging
                              ? 'border-blue-400 bg-blue-500/10'
                              : 'border-white/15 bg-white/4 hover:border-white/25 hover:bg-white/6'
                          }`}
            >
              <Upload className='h-7 w-7 text-white/30' />
              <div className='text-center'>
                <p className='text-sm text-white/60'>Drop a PDF or DOCX here</p>
                <p className='text-xs text-white/30'>or click to browse · max 15 MB</p>
              </div>
              <input
                ref={inputRef}
                type='file'
                accept='.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) validateAndSetFile(file);
                }}
              />
            </div>
          ) : (
            <div className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-4 py-3'>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                               ${isPdf ? 'bg-red-500/20' : 'bg-blue-500/20'}`}
              >
                {isPdf ? (
                  <FileText className='h-4 w-4 text-red-400' />
                ) : (
                  <FileIcon className='h-4 w-4 text-blue-400' />
                )}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm text-white'>{selectedFile.name}</p>
                <p className='text-xs text-white/30'>
                  {(selectedFile.size / 1048576).toFixed(1)} MB
                </p>
              </div>
              <button
                type='button'
                onClick={() => setSelectedFile(null)}
                className='shrink-0 text-white/30 hover:text-white/60'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          )}

          {fileError && <p className='text-xs text-red-400'>{fileError}</p>}

          {/* Metadata fields */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='col-span-2'>
              <label className='mb-1 block text-xs text-white/50'>Subject</label>
              <input
                {...register('subject')}
                placeholder='e.g. CS3101 - Data Structures'
                className='w-full rounded-lg border border-white/10 bg-white/6 px-3 py-2
                           text-sm text-white placeholder-white/25 focus:border-white/25 focus:outline-none'
              />
            </div>

            <div>
              <label className='mb-1 block text-xs text-white/50'>Category</label>
              <Combobox
                value={CATEGORY_OPTIONS.find((o) => o.value === categoryValue)?.label ?? ''}
                onValueChange={(label) =>
                  setValue('category', CATEGORY_OPTIONS.find((o) => o.label === label)?.value ?? '')
                }
              >
                <ComboboxInput
                  readOnly
                  showTrigger
                  showClear={false}
                  placeholder='Select…'
                  className='rounded-lg border-white/10 bg-white/6 shadow-none
                             focus-within:border-white/25 focus-within:ring-0
                             [&_input]:text-sm [&_input]:text-white [&_input]:placeholder:text-white/25
                             [&_button]:text-white/40 [&_button:hover]:bg-white/10'
                />
                <ComboboxContent className='border border-white/10 bg-black/80 text-white shadow-xl backdrop-blur-md'>
                  <ComboboxList>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <ComboboxItem
                        key={opt.value}
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

            <div>
              <label className='mb-1 block text-xs text-white/50'>Year Level</label>
              <Combobox
                value={YEAR_OPTIONS.find((o) => o.value === yearLevelValue)?.label ?? ''}
                onValueChange={(label) => {
                  const opt = YEAR_OPTIONS.find((o) => o.label === label);
                  setValue('yearLevel', opt ? Number(opt.value) : '');
                }}
              >
                <ComboboxInput
                  readOnly
                  showTrigger
                  showClear={false}
                  placeholder='Any'
                  className='rounded-lg border-white/10 bg-white/6 shadow-none
                             focus-within:border-white/25 focus-within:ring-0
                             [&_input]:text-sm [&_input]:text-white [&_input]:placeholder:text-white/25
                             [&_button]:text-white/40 [&_button:hover]:bg-white/10'
                />
                <ComboboxContent className='border border-white/10 bg-black/80 text-white shadow-xl backdrop-blur-md'>
                  <ComboboxList>
                    {YEAR_OPTIONS.map((opt) => (
                      <ComboboxItem
                        key={opt.value}
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

            <div className='col-span-2'>
              <label className='mb-1 block text-xs text-white/50'>Tags (comma-separated)</label>
              <input
                {...register('tags')}
                placeholder='algorithms, midterm, 2024'
                className='w-full rounded-lg border border-white/10 bg-white/6 px-3 py-2
                           text-sm text-white placeholder-white/25 focus:border-white/25 focus:outline-none'
              />
            </div>

            <div className='col-span-2'>
              <label className='mb-1 block text-xs text-white/50'>Description</label>
              <textarea
                {...register('description')}
                rows={2}
                placeholder='Brief description…'
                className='w-full resize-none rounded-lg border border-white/10 bg-white/6 px-3 py-2
                           text-sm text-white placeholder-white/25 focus:border-white/25 focus:outline-none'
              />
            </div>

            <div className='col-span-2 flex items-center gap-2'>
              <input
                type='checkbox'
                id='isPublic'
                {...register('isPublic')}
                className='rounded'
                defaultChecked
              />
              <label htmlFor='isPublic' className='text-xs text-white/50'>
                Visible to everyone in the library
              </label>
            </div>
          </div>

          {/* Upload progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
              <div
                className='h-full rounded-full bg-blue-500 transition-all'
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Submit */}
          <button
            type='submit'
            disabled={!selectedFile || uploadMutation.isPending}
            className='flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5
                       text-sm font-medium text-white transition-colors hover:bg-blue-500
                       disabled:cursor-not-allowed disabled:opacity-40'
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' /> Uploading…
              </>
            ) : (
              <>
                <Upload className='h-4 w-4' /> Upload File
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
