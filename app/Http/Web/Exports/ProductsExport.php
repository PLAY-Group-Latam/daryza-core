<?php

namespace App\Http\Web\Exports;

use App\Models\Products\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ProductsExport implements FromCollection, WithHeadings
{
  public function collection()
  {
    return Product::select(
      'code',
      'name',
      'brief_description',
      'description'
    )->get();
  }

  public function headings(): array
  {
    return [
      'Código',
      'Nombre',
      'Descripción corta',
      'Descripción',
    ];
  }
}
