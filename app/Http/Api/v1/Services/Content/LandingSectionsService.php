<?php

namespace App\Http\Api\v1\Services\Content;

use App\Models\Landings\Landing;

class LandingSectionsService
{
    public function getSectionsPayload(?string $slug = null): array
    {
        $landingQuery = Landing::query()
            ->where('is_active', true);

        if (is_string($slug) && $slug !== '') {
            $landingQuery->where('slug', $slug);
        } else {
            $landingQuery->latest();
        }

        $landing = $landingQuery->first();

        if (!$landing) {
            return ['sections' => new \stdClass()];
        }

        $storedSections = is_array($landing->sections) ? $landing->sections : [];
        $sections = [];

        $banner = $this->buildBanner($storedSections['banner'] ?? []);
        if ($banner !== null) {
            $sections['banner'] = $banner;
        }

        $brandStory = $this->buildBrandStory($storedSections['brandStory'] ?? []);
        if ($brandStory !== null) {
            $sections['brandStory'] = $brandStory;
        }

        $features = $this->buildFeatures($storedSections['features'] ?? []);
        if ($features !== null) {
            $sections['features'] = $features;
        }

        $knowMore = $this->buildKnowMore($storedSections['knowMore'] ?? []);
        if ($knowMore !== null) {
            $sections['knowMore'] = $knowMore;
        }

        return [
            'sections' => empty($sections) ? new \stdClass() : $sections,
        ];
    }

    private function buildBanner(array $content): ?array
    {
        $slides = $content['slides'] ?? null;

        if (!is_array($slides) || empty($slides)) {
            return null;
        }

        $normalizedSlides = array_values(array_filter(array_map(function ($slide): array {
            $rawType = $slide['type'] ?? 'image';
            $type = in_array($rawType, ['image', 'video'], true) ? $rawType : 'image';

            return [
                'id' => (string) ($slide['id'] ?? ''),
                'is_active' => filter_var($slide['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'type' => $type,
                'src_desktop' => $slide['src_desktop'] ?? null,
                'src_mobile' => $slide['src_mobile'] ?? null,
                'src_video' => $slide['src_video'] ?? null,
                'link_url' => $slide['link_url'] ?? null,
            ];
        }, $slides), function (array $slide): bool {
            return $slide['src_desktop'] !== null
                || $slide['src_mobile'] !== null
                || $slide['src_video'] !== null;
        }));

        if (empty($normalizedSlides)) {
            return null;
        }

        return ['slides' => $normalizedSlides];
    }

    private function buildBrandStory(mixed $content): ?array
    {
        if (!is_array($content)) {
            return null;
        }

        $media = is_array($content['media'] ?? null) ? $content['media'] : [];
        $rawType = $media['type'] ?? 'image';
        $payload = [
            'title' => (string) ($content['title'] ?? ''),
            'subtitle' => isset($content['subtitle']) ? (string) $content['subtitle'] : null,
            'description' => (string) ($content['description'] ?? ''),
            'media' => [
                'type' => in_array($rawType, ['image', 'video'], true) ? $rawType : 'image',
                'src_desktop' => $media['src_desktop'] ?? null,
                'src_mobile' => $media['src_mobile'] ?? null,
                'src_video' => $media['src_video'] ?? null,
            ],
        ];

        $isConfigured = $payload['title'] !== ''
            || (($payload['subtitle'] ?? '') !== '')
            || $payload['description'] !== ''
            || $payload['media']['src_desktop'] !== null
            || $payload['media']['src_mobile'] !== null
            || $payload['media']['src_video'] !== null;

        if (!$isConfigured) {
            return null;
        }

        return $payload;
    }

    private function buildFeatures(mixed $content): ?array
    {
        if (!is_array($content)) {
            return null;
        }

        $title = (string) ($content['title'] ?? '');
        $items = $content['items'] ?? [];

        if (!is_array($items)) {
            $items = [];
        }

        $payload = [
            'title' => $title,
            'items' => array_values(array_map(fn ($item): array => [
                'title' => (string) ($item['title'] ?? ''),
                'description' => (string) ($item['description'] ?? ''),
                'image' => (string) ($item['image'] ?? ''),
            ], $items)),
        ];

        $hasItemContent = collect($payload['items'])->contains(function (array $item): bool {
            return $item['title'] !== '' || $item['description'] !== '' || $item['image'] !== '';
        });

        if (!$hasItemContent && $payload['title'] === '') {
            return null;
        }

        return $payload;
    }

    private function buildKnowMore(mixed $content): ?array
    {
        if (!is_array($content)) {
            return null;
        }

        $title = (string) ($content['title'] ?? '');
        $items = $content['items'] ?? [];

        if (!is_array($items)) {
            $items = [];
        }

        $payload = [
            'title' => $title,
            'items' => array_values(array_map(fn ($item): array => [
                'id' => (string) ($item['id'] ?? ''),
                'title' => (string) ($item['title'] ?? ''),
                'description' => (string) ($item['description'] ?? ''),
                'image' => (string) ($item['image'] ?? ''),
            ], $items)),
        ];

        $hasItemContent = collect($payload['items'])->contains(function (array $item): bool {
            return $item['title'] !== '' || $item['description'] !== '' || $item['image'] !== '';
        });

        if (!$hasItemContent && $payload['title'] === '') {
            return null;
        }

        return $payload;
    }
}
