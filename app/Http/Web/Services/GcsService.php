<?php

namespace App\Http\Web\Services;

use Google\Cloud\Storage\StorageClient;
use Illuminate\Http\UploadedFile;

class GcsService
{
    protected StorageClient $storage;
    protected $bucket;

    public function __construct()
    {
        $this->storage = new StorageClient([
            'projectId' => config('services.gcs.project_id'),
            'keyFilePath' => base_path(config('services.gcs.key_file')),
        ]);

        $this->bucket = $this->storage->bucket(config('services.gcs.bucket'));
    }

 

    /**
     * Subir un archivo desde un formulario (Request->file)
     */
    public function uploadFile(UploadedFile $file, string $directory = 'uploads'): string
    {
        $filename = uniqid() . '.' . $file->getClientOriginalExtension();
        $path = trim($directory, '/') . '/' . $filename;

        $this->bucket->upload(
            fopen($file->getRealPath(), 'r'),
            [
                'name' => $path,
                'metadata' => [
                    'contentType' => $file->getMimeType(),
                ],
            ]
        );

        return $this->getPublicUrl($path);
    }

    /**
     * Subir cualquier archivo por ruta local
     */
    public function uploadFromPath(string $localPath, string $path): string
    {
        $this->bucket->upload(
            fopen($localPath, 'r'),
            [
                'name' => $path,
            ]
        );

        return $this->getPublicUrl($path);
    }

    /**
     * Eliminar archivo
     */
    public function delete(string $path): bool
    {
        $object = $this->bucket->object($path);

        if ($object->exists()) {
            $object->delete();
            return true;
        }

        return false;
    }

    /**
     * Generar URL pública
     * (solo funciona si el bucket es público o tienes reglas de acceso)
     */
    public function getPublicUrl(string $path): string
    {
        return sprintf(
            'https://storage.googleapis.com/%s/%s',
            config('services.gcs.bucket'),
            $path
        );
    }
}
