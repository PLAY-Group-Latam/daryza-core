<?php

namespace App\Http\Web\Services\JobsPortal;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ApplicationCvStorageService
{
    public function store(UploadedFile $file): string
    {
        $originalName = basename($file->getClientOriginalName());

        return Storage::disk('public')->putFileAs('applications/cv', $file, $originalName);
    }
}
