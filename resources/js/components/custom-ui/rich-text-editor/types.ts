export type UploadImage = (file: File) => Promise<string | null>;

export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    uploadImage?: UploadImage;
}
