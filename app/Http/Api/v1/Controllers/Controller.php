<?php

namespace App\Http\Api\v1\Controllers;

use App\Http\Api\Traits\ApiTrait;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    use  DispatchesJobs, ValidatesRequests, ApiTrait;
}
