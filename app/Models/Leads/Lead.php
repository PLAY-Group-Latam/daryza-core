<?php

namespace App\Models\Leads;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Support\Facades\Storage;

class Lead extends Model
{
    use SoftDeletes, HasUlids;

    protected $table = 'leads'; 

    const TYPE_ABOUT_US = 'about_us';
    const TYPE_HELP_CENTER = 'help_center';
    const TYPE_DISTRIBUTOR = 'distributor_network';
    const TYPE_ADVISOR = 'sales_advisor';        
    const TYPE_CUSTOMER_SERVICE = 'customer_service';
    const TYPE_WORK_WITH_US = 'work_with_us';
    const TYPE_CLAIM = 'claim';

    const STATUS_NEW = 'new';
    const STATUS_CONTACTED = 'contacted';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_RESOLVED = 'resolved';
    const STATUS_CLOSED = 'closed';
    const STATUS_LOST = 'lost';

    protected $fillable = [
        'type', 'full_name', 'email', 'phone', 
        'data', 'file_path', 'file_original_name', 'status',
    ];

    protected $casts = [
        'data' => 'array',
    ];

 
    protected $appends = ['file_url', 'type_name', 'status_name'];


    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

   
    public function getFileUrlAttribute()
    {
       
        return $this->file_path ? Storage::url($this->file_path) : null;
    }

    public function getTypeNameAttribute()
    {
        
        $types = [
            self::TYPE_ABOUT_US         => 'Sobre Nosotros',
            self::TYPE_HELP_CENTER      => 'Centro de Ayuda',
            self::TYPE_DISTRIBUTOR      => 'Red de Distribuidores',
            self::TYPE_ADVISOR          => 'Asesor de Ventas',
            self::TYPE_CUSTOMER_SERVICE => 'Atención al Cliente',
            self::TYPE_WORK_WITH_US     => 'Trabaja con Nosotros',
            self::TYPE_CLAIM            => 'Reclamación',
        ];
        
        return $types[$this->type] ?? 'Desconocido';
    }

    public function getStatusNameAttribute()
    {
        $statuses = [
            self::STATUS_NEW         => 'Nuevo',
            self::STATUS_CONTACTED   => 'Contactado',
            self::STATUS_IN_PROGRESS => 'En Progreso',
            self::STATUS_RESOLVED    => 'Resuelto',
            self::STATUS_CLOSED      => 'Cerrado',
            self::STATUS_LOST        => 'Perdido',
        ];
        
        return $statuses[$this->status] ?? 'Desconocido';
    }
}