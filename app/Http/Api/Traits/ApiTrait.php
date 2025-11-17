<?php

namespace App\Http\Api\Traits;

trait ApiTrait
{
  public function success($message = null, $data = null, $status = 200)
  {
    return response()->json([
      'success' => true,
      'message' => $message,
      'data'    => $data,
    ], $status);
  }

  public function created($message = null, $data = null)
  {
    return $this->success($message, $data, 201);
  }

  public function error($message, $errors = null, $status = 400)
  {
    return response()->json([
      'success' => false,
      'message' => $message,
      'errors'  => $errors,
    ], $status);
  }

  public function paginated($message = null, $paginator)
  {
    return response()->json([
      'success' => true,
      'message' => $message,
      'data'    => $paginator->items(),
      'meta'    => [
        'total'        => $paginator->total(),
        'current_page' => $paginator->currentPage(),
        'per_page'     => $paginator->perPage(),
        'last_page'    => $paginator->lastPage(),
      ]
    ]);
  }
}
