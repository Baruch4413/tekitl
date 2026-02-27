import { router, usePage } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';

interface AvatarUploadProps {
    imageUrl?: string | null;
    name: string;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number): Crop {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, 1, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight,
    );
}

export default function AvatarUpload({ imageUrl, name }: AvatarUploadProps) {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImgSrc(reader.result as string);
            setOpen(true);
        });
        reader.readAsDataURL(file);

        e.target.value = '';
    }, []);

    const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setCrop(centerAspectCrop(naturalWidth, naturalHeight));
    }, []);

    const handleSave = useCallback(() => {
        const image = imgRef.current;
        if (!image || !crop) return;

        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const pixelCrop = {
            x: (crop.x / 100) * image.width * scaleX,
            y: (crop.y / 100) * image.height * scaleY,
            width: (crop.width / 100) * image.width * scaleX,
            height: (crop.height / 100) * image.height * scaleY,
        };

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height,
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) return;

                const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

                setUploading(true);
                router.post(ProfileController.updateAvatar.url(), { avatar: file }, {
                    preserveScroll: true,
                    onFinish: () => {
                        setUploading(false);
                        setOpen(false);
                        setImgSrc('');
                    },
                });
            },
            'image/jpeg',
            0.9,
        );
    }, [crop]);

    const handleCancel = useCallback(() => {
        setOpen(false);
        setImgSrc('');
    }, []);

    return (
        <>
            <div className="flex items-center gap-x-8">
                {imageUrl ? (
                    <img
                        alt=""
                        src={imageUrl}
                        className="size-24 flex-none rounded-lg bg-gray-100 object-cover outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                    />
                ) : (
                    <span className="flex size-24 flex-none items-center justify-center rounded-lg bg-indigo-100 text-3xl font-bold text-indigo-600 outline -outline-offset-1 outline-black/5 dark:bg-indigo-900 dark:text-indigo-300 dark:outline-white/10">
                        {name.charAt(0).toUpperCase()}
                    </span>
                )}
                <div>
                    <button
                        type="button"
                        onClick={handleFileSelect}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                    >
                        Cambiar foto
                    </button>
                    <p className="mt-2 text-xs/5 text-gray-500 dark:text-gray-400">
                        JPG, GIF o PNG. 1MB max.
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            <Dialog open={open} onOpenChange={(v) => !uploading && !v && handleCancel()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Recortar foto</DialogTitle>
                        <DialogDescription>
                            Ajusta el recorte de tu foto de perfil.
                        </DialogDescription>
                    </DialogHeader>

                    {imgSrc && (
                        <div className="flex justify-center">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    ref={imgRef}
                                    alt="Recortar"
                                    src={imgSrc}
                                    onLoad={handleImageLoad}
                                    className="max-h-[60vh]"
                                />
                            </ReactCrop>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={uploading}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleSave} disabled={uploading}>
                            {uploading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
