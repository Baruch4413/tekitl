<?php

namespace App\Services;

use App\AvatarSize;
use App\CoverPhotoSize;
use App\ProjectImageSize;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;
use Intervention\Image\MediaType;

class ImageService
{
    private ImageManager $manager;

    public function __construct()
    {
        $this->manager = ImageManager::imagick();
    }

    /**
     * Process an avatar upload into multiple WebP variants.
     *
     * @return string Base path (without suffix/extension), e.g. "avatars/abc123"
     */
    public function processAvatar(UploadedFile $file): string
    {
        $basePath = 'avatars/'.Str::ulid();
        $image = $this->manager->read($file->getPathname());

        foreach (AvatarSize::cases() as $size) {
            $this->storeVariant($image, $basePath, $size->value, $size->width());
        }

        return $basePath;
    }

    /**
     * Process a cover photo upload into multiple WebP variants.
     *
     * @return string Base path (without suffix/extension), e.g. "covers/abc123"
     */
    public function processCoverPhoto(UploadedFile $file): string
    {
        $basePath = 'covers/'.Str::ulid();
        $image = $this->manager->read($file->getPathname());

        foreach (CoverPhotoSize::cases() as $size) {
            $this->storeVariant($image, $basePath, $size->value, $size->width());
        }

        return $basePath;
    }

    /**
     * Process a project image upload into multiple WebP variants.
     *
     * @return string Base path (without suffix/extension), e.g. "projects/abc123"
     */
    public function processProjectImage(UploadedFile $file): string
    {
        $basePath = 'projects/'.Str::ulid();
        $image = $this->manager->read($file->getPathname());

        foreach (ProjectImageSize::cases() as $size) {
            $this->storeVariant($image, $basePath, $size->value, $size->width(), $size->quality());
        }

        return $basePath;
    }

    /**
     * Delete all variants for a given base path and size enum.
     *
     * @param  list<string>  $sizeValues
     */
    public function deleteVariants(string $basePath, array $sizeValues): void
    {
        $paths = array_map(
            fn (string $size) => "{$basePath}-{$size}.webp",
            $sizeValues,
        );

        Storage::disk('s3')->delete($paths);
    }

    private function storeVariant(ImageInterface $image, string $basePath, string $sizeName, ?int $width, int $quality = 80): void
    {
        $variant = clone $image;

        if ($width !== null) {
            $variant->scaleDown(width: $width);
        }

        $encoded = $variant->encodeByMediaType(MediaType::IMAGE_WEBP, quality: $quality);

        Storage::disk('s3')->put(
            "{$basePath}-{$sizeName}.webp",
            (string) $encoded,
        );
    }
}
