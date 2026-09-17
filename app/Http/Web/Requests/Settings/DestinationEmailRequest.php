<?php

namespace App\Http\Web\Requests\Settings;

use App\Models\Settings\DestinationEmail;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DestinationEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'pages' => ['required', 'array', 'min:1'],
            'pages.*' => ['required', 'string', Rule::in(DestinationEmail::pageKeys())],
            'is_active' => ['required', 'boolean'],
        ];
    }

    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);

        if (isset($data['pages'])) {
            $data['page_keys'] = $data['pages'];
            unset($data['pages']);
        }

        return $data;
    }

    protected function passedValidation(): void
    {
        if (!$this->boolean('is_active')) {
            return;
        }

        $destinationEmail = $this->route('destinationEmail');
        $currentId = $destinationEmail instanceof DestinationEmail ? $destinationEmail->id : null;
        $pages = array_values(array_unique($this->input('pages', [])));

        $duplicatedPages = DestinationEmail::query()
            ->active()
            ->when($currentId, fn ($query) => $query->whereKeyNot($currentId))
            ->where(function ($query) use ($pages) {
                foreach ($pages as $page) {
                    $query->orWhereJsonContains('page_keys', $page);
                }
            })
            ->get()
            ->flatMap(fn (DestinationEmail $email) => $email->page_keys ?? [])
            ->intersect($pages)
            ->unique()
            ->values();

        if ($duplicatedPages->isEmpty()) {
            return;
        }

        $labels = DestinationEmail::pageLabels();
        $readablePages = $duplicatedPages
            ->map(fn (string $page) => $labels[$page] ?? $page)
            ->implode(', ');

        throw ValidationException::withMessages([
            'pages' => "Ya existe un email activo configurado para: {$readablePages}.",
        ]);
    }
}