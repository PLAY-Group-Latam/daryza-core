<?php
// app/Enums/AttributeType.php
namespace App\Enums;

enum AttributeType: string
{
  case SELECT = 'select';
    // case NUMBER = 'number';
    // case BOOLEAN = 'boolean';
  case TEXT = 'text';

  public function label(): string
  {
    return match ($this) {
      self::SELECT => 'Lista de opciones',
      // self::NUMBER => 'Número',
      // self::BOOLEAN => 'Sí / No',
      self::TEXT => 'Texto libre',
    };
  }

  public static function options(): array
  {
    return array_map(fn($case) => [
      'value' => $case->value,
      'label' => $case->label(),
    ], self::cases());
  }
}
