<?php

use App\AvatarSize;
use App\Services\ImageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('s3');
});

test('uploaded images have metadata stripped', function () {
    // Create a JPEG with EXIF metadata using Imagick
    $imagick = new Imagick;
    $imagick->newImage(200, 200, new ImagickPixel('red'));
    $imagick->setImageFormat('jpeg');
    $imagick->setImageProperty('exif:Make', 'TestCamera');
    $imagick->setImageProperty('exif:Model', 'TestModel');

    $tempPath = tempnam(sys_get_temp_dir(), 'img').'.jpg';
    $imagick->writeImage($tempPath);
    $imagick->clear();

    $file = new UploadedFile($tempPath, 'photo.jpg', 'image/jpeg', null, true);

    $service = app(ImageService::class);
    $basePath = $service->processAvatar($file);

    // Read back any stored variant and verify no EXIF metadata
    $variant = AvatarSize::cases()[0];
    $contents = Storage::disk('s3')->get("{$basePath}-{$variant->value}.webp");

    $result = new Imagick;
    $result->readImageBlob($contents);
    $properties = $result->getImageProperties('exif:*');

    expect($properties)->toBeEmpty();

    @unlink($tempPath);
});
