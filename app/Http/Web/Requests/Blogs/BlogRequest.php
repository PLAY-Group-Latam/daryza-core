<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BlogRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true; // ajusta según permisos
  }

  public function rules(): array
  {
    return [
      'title' => 'required|string|max:255',
      'slug' => 'required|string|max:255|unique:blogs,slug,' . $this->blog?->id,
      'description' => 'required|string',
      'content' => 'required|string',
      'image' => 'nullable|string',
      'miniature' => 'nullable|string',
      'author' => 'required|string|max:255',
      'visibility' => 'boolean',
      'publication_date' => 'required|date',
      'categories' => 'nullable|array',
      'categories.*' => 'exists:blog_categories,id',
      'metadata' => 'nullable|array',
      'metadata.meta_title' => 'nullable|string|max:255',
      'metadata.meta_description' => 'nullable|string|max:500',
      'metadata.meta_keywords' => 'nullable|string|max:255',
      'metadata.og_title' => 'nullable|string|max:255',
      'metadata.og_description' => 'nullable|string|max:500',
      'metadata.og_image' => 'nullable|string|max:255',
      'metadata.og_type' => 'nullable|string|max:50',
      'metadata.canonical_url' => 'nullable|string|max:255',
      'metadata.noindex' => 'boolean',
      'metadata.nofollow' => 'boolean',
    ];
  }
}
