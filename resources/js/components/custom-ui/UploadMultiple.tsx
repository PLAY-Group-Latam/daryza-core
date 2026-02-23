'use client';

import { Media } from '@/types/products/media';
import { FileVideoIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { useRef } from 'react';

type UploadItem = File | Media;

interface UploadMultipleProps {
    value?: UploadItem[];
    onFilesChange?: (files: UploadItem[]) => void;
    previewClassName?: string;
    accept?: 'image' | 'video' | 'both';
}

const ACCEPT_MAP = {
    image: 'image/*',
    video: 'video/*',
    both: 'image/*,video/*',
};

const isVideo = (item: UploadItem) =>
    item instanceof File
        ? item.type.startsWith('video/')
        : item.type === 'video';

const getPreview = (item: UploadItem) =>
    item instanceof File ? URL.createObjectURL(item) : item.file_path;

export function UploadMultiple({
    value = [],
    onFilesChange,
    previewClassName,
    accept = 'both',
}: UploadMultipleProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const dragIndex = useRef<number | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (!files.length) return;
        onFilesChange?.([...value, ...files]);
        e.target.value = '';
    };

    const handleRemove = (index: number) => {
        onFilesChange?.(value.filter((_, i) => i !== index));
    };

    const handleDrop = (dropIndex: number) => {
        if (dragIndex.current === null || dragIndex.current === dropIndex)
            return;
        const next = [...value];
        const [moved] = next.splice(dragIndex.current, 1);
        next.splice(dropIndex, 0, moved);
        dragIndex.current = null;
        onFilesChange?.(next);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {value.map((item, i) => {
                const src = getPreview(item);
                const video = isVideo(item);
                const key =
                    item instanceof File ? `file-${item.name}-${i}` : item.id;

                return (
                    <div
                        key={key}
                        className={`group relative cursor-grab active:cursor-grabbing ${previewClassName}`}
                        draggable
                        onDragStart={() => (dragIndex.current = i)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(i)}
                    >
                        {video ? (
                            <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-slate-100">
                                <video
                                    src={src}
                                    className="h-full w-full object-cover"
                                    muted
                                    onMouseEnter={(e) =>
                                        (
                                            e.currentTarget as HTMLVideoElement
                                        ).play()
                                    }
                                    onMouseLeave={(e) => {
                                        const v =
                                            e.currentTarget as HTMLVideoElement;
                                        v.pause();
                                        v.currentTime = 0;
                                    }}
                                />
                                <div className="absolute bottom-1 left-1 rounded bg-black/60 p-0.5">
                                    <FileVideoIcon className="h-3 w-3 text-white" />
                                </div>
                            </div>
                        ) : (
                            <img
                                src={src}
                                className="h-24 w-24 rounded-xl border object-cover"
                                alt={`media-${i}`}
                            />
                        )}

                        {item instanceof File && (
                            <span className="absolute bottom-1 left-1 rounded bg-indigo-600 px-1 py-px text-[9px] leading-none text-white">
                                Nueva
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={() => handleRemove(i)}
                            className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-red-600"
                        >
                            <Trash2Icon className="h-3 w-3" />
                        </button>
                    </div>
                );
            })}

            <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500"
            >
                <UploadIcon className="h-5 w-5" />
                <span className="text-center text-[10px] leading-tight">
                    {accept === 'image'
                        ? 'Imagen'
                        : accept === 'video'
                          ? 'Video'
                          : 'Imagen / Video'}
                </span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_MAP[accept]}
                multiple
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}
