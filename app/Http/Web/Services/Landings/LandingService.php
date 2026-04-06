<?php

namespace App\Http\Web\Services\Landings;

use App\Http\Web\Services\GcsService;
use App\Models\Landings\Landing;
use App\Models\Landings\LandingLead;
use App\Models\Metadata;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class LandingService
{
    public function __construct(
        protected GcsService $gcs
    ) {}

    public function getPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return Landing::query()
            ->withCount('leads')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function save(array $data, ?Landing $landing = null): Landing
    {
        $metadata = $data['metadata'] ?? [];
        $sections = $data['sections'] ?? [];

        if (!$landing) {
            $landing = Landing::query()->create([
                'title' => $data['title'],
                'slug' => $data['slug'],
                'is_active' => $data['is_active'] ?? true,
                'sections' => [],
            ]);
        }

        $processedSections = $this->processSectionsMedia($sections, (string) $landing->id);

        $landing->update([
            'title' => $data['title'],
            'slug' => $data['slug'],
            'is_active' => $data['is_active'] ?? true,
            'sections' => $processedSections,
        ]);

        $this->upsertMetadata($landing, $metadata, $processedSections);

        return $this->withMetadata($landing->refresh());
    }

    private function upsertMetadata(Landing $landing, array $metadata, array $sections = []): void
    {
        $defaultCanonical = rtrim((string) config('app.frontend_url'), '/') . '/landing/producto/' . $landing->slug;
        $existingMetadata = $landing->metadata()->first();

        $brandStoryDescription = (string) data_get($sections, 'brandStory.description', '');
        $defaultMetaDescription = $brandStoryDescription !== '' ? $brandStoryDescription : null;
        $defaultKeywords = $this->buildDefaultKeywords($landing->title, $brandStoryDescription, $landing->slug);
        $resolvedMetaTitle = $this->limitNullableString(
            $metadata['meta_title'] ?? $landing->title,
            160
        );
        $resolvedMetaDescription = $this->limitNullableString(
            $metadata['meta_description'] ?? $existingMetadata?->meta_description ?? $defaultMetaDescription,
            320
        );

        $ogImage = $this->resolveMediaValue($metadata['og_image'] ?? null, "landings/{$landing->id}/metadata")
            ?? $existingMetadata?->og_image;

        $payload = [
            'meta_title' => $resolvedMetaTitle,
            'meta_description' => $resolvedMetaDescription,
            'meta_keywords' => $this->limitNullableString($metadata['meta_keywords'] ?? $existingMetadata?->meta_keywords ?? $defaultKeywords, 255),
            'og_title' => $resolvedMetaTitle,
            'og_description' => $resolvedMetaDescription,
            'og_image' => $this->limitNullableString($ogImage, 500),
            'og_type' => $this->limitNullableString($metadata['og_type'] ?? 'website', 50),
            'canonical_url' => $this->limitNullableString($metadata['canonical_url'] ?? $defaultCanonical, 500),
            'noindex' => false,
            'nofollow' => false,
        ];

        $landing->metadata()->updateOrCreate(
            [
                'metadatable_id' => (string) $landing->id,
                'metadatable_type' => Landing::class,
            ],
            $payload
        );
    }

    public function getLeadsByLanding(string $landingId, int $perPage = 20): LengthAwarePaginator
    {
        return LandingLead::query()
            ->where('landing_id', $landingId)
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    private function withMetadata(Landing $landing): Landing
    {
        $metadata = Metadata::query()
            ->where('metadatable_type', Landing::class)
            ->where('metadatable_id', (string) $landing->id)
            ->first();

        $landing->setRelation('metadata', $metadata);

        return $landing;
    }

    private function processSectionsMedia(array $sections, string $landingId): array
    {
        $payload = [];

        if (is_array($sections['banner'] ?? null)) {
            $slides = is_array($sections['banner']['slides'] ?? null) ? $sections['banner']['slides'] : [];
            $payload['banner'] = [
                'slides' => array_values(array_map(function ($slide) use ($landingId): array {
                    $type = in_array(($slide['type'] ?? 'image'), ['image', 'video'], true)
                        ? $slide['type']
                        : 'image';

                    return [
                        'id' => (string) ($slide['id'] ?? Str::ulid()),
                        'is_active' => filter_var($slide['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                        'type' => $type,
                        'src_desktop' => $this->resolveMediaValue(
                            $slide['src_desktop'] ?? null,
                            "landings/{$landingId}/banner/desktop"
                        ),
                        'src_mobile' => $this->resolveMediaValue(
                            $slide['src_mobile'] ?? null,
                            "landings/{$landingId}/banner/mobile"
                        ),
                        'src_video' => $this->resolveMediaValue(
                            $slide['src_video'] ?? null,
                            "landings/{$landingId}/banner/videos"
                        ),
                        'link_url' => !empty($slide['link_url']) ? (string) $slide['link_url'] : null,
                    ];
                }, $slides)),
            ];
        }

        if (is_array($sections['brandStory'] ?? null)) {
            $media = is_array($sections['brandStory']['media'] ?? null) ? $sections['brandStory']['media'] : [];
            $mediaType = in_array(($media['type'] ?? 'image'), ['image', 'video'], true)
                ? $media['type']
                : 'image';

            $singleImage = $this->resolveMediaValue(
                $media['src_desktop'] ?? $media['src_mobile'] ?? null,
                "landings/{$landingId}/brand-story/image"
            );
            $singleVideo = $this->resolveMediaValue(
                $media['src_video'] ?? null,
                "landings/{$landingId}/brand-story/video"
            );

            $payload['brandStory'] = [
                'title' => (string) ($sections['brandStory']['title'] ?? ''),
                'subtitle' => isset($sections['brandStory']['subtitle'])
                    ? (string) $sections['brandStory']['subtitle']
                    : null,
                'description' => (string) ($sections['brandStory']['description'] ?? ''),
                'media' => [
                    'type' => $mediaType,
                    'src_desktop' => $mediaType === 'image' ? $singleImage : null,
                    'src_mobile' => $mediaType === 'image' ? $singleImage : null,
                    'src_video' => $mediaType === 'video' ? $singleVideo : null,
                ],
            ];
        }

        if (is_array($sections['features'] ?? null)) {
            $items = is_array($sections['features']['items'] ?? null) ? $sections['features']['items'] : [];
            $items = array_slice($items, 0, 3);

            $payload['features'] = [
                'title' => (string) ($sections['features']['title'] ?? ''),
                'items' => array_values(array_map(function ($item) use ($landingId): array {
                    return [
                        'title' => (string) ($item['title'] ?? ''),
                        'description' => (string) ($item['description'] ?? ''),
                        'image' => $this->resolveMediaValue(
                            $item['image'] ?? null,
                            "landings/{$landingId}/features"
                        ) ?? '',
                    ];
                }, $items)),
            ];
        }

        if (is_array($sections['knowMore'] ?? null)) {
            $items = is_array($sections['knowMore']['items'] ?? null) ? $sections['knowMore']['items'] : [];

            $payload['knowMore'] = [
                'title' => (string) ($sections['knowMore']['title'] ?? ''),
                'items' => array_values(array_map(function ($item) use ($landingId): array {
                    return [
                        'id' => (string) ($item['id'] ?? Str::ulid()),
                        'title' => (string) ($item['title'] ?? ''),
                        'description' => (string) ($item['description'] ?? ''),
                        'image' => $this->resolveMediaValue(
                            $item['image'] ?? null,
                            "landings/{$landingId}/know-more"
                        ) ?? '',
                    ];
                }, $items)),
            ];
        }

        return $payload;
    }

    private function resolveMediaValue(mixed $value, string $directory): ?string
    {
        if ($value instanceof UploadedFile) {
            return $this->gcs->uploadFile($value, $directory);
        }

        if (is_string($value) && $value !== '') {
            return $value;
        }

        return null;
    }

    private function buildDefaultKeywords(string $title, string $description, string $slug): string
    {
        $candidates = collect([
            $title,
            str_replace('-', ' ', $slug),
            'landing',
            'campana',
            'daryza',
        ]);

        if ($description !== '') {
            $candidates = $candidates->merge(
                collect(explode(' ', Str::lower($description)))->filter(fn ($word) => strlen($word) >= 5)->take(3)
            );
        }

        return $candidates
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique()
            ->implode(', ');
    }

    private function limitNullableString(mixed $value, int $max): ?string
    {
        if ($value === null) {
            return null;
        }

        $stringValue = trim((string) $value);
        if ($stringValue === '') {
            return null;
        }

        return mb_substr($stringValue, 0, $max);
    }
}
