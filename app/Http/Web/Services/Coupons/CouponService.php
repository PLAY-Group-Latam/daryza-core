<?php

namespace App\Http\Web\Services\Coupons;

use App\Models\Coupons\Coupon;
use App\Models\Coupons\CouponRedemption;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Models\Customers\Customer;
use App\Models\Products\DynamicCategory;
use App\Models\Products\Product;
use App\Models\Products\ProductCategory;
use App\Models\Products\ProductPack;

class CouponService
{
    private const ULID_REGEX = '/^[0-9A-HJKMNP-TV-Z]{26}$/i';

    // ─── Queries ──────────────────────────────────────────────

   public function getPaginatedCoupons(int $perPage = 10, ?string $search = null): LengthAwarePaginator
{
    return Coupon::with(['products', 'categories', 'packs', 'businessDynamics', 'customers'])
        ->withCount('redemptions as usage_count')
        ->when($search, function ($query, $search) {
            $query->where('code', 'ilike', "%{$search}%")
                  ->orWhere('scope', 'ilike', "%{$search}%");
        })
        ->latest()
        ->paginate($perPage);
}

    public function getCouponById(string $id): Coupon
    {
        return Coupon::with(['products', 'categories', 'packs', 'businessDynamics', 'customers'])
            ->withCount('redemptions as usage_count')
            ->findOrFail($id);
    }

    // ─── Mutaciones ───────────────────────────────────────────

    public function createCoupon(array $data): Coupon
    {
        return DB::transaction(function () use ($data) {
            $coupon = Coupon::create([
                'code'                    => strtoupper(trim((string) $data['code'])),
                'description'             => $data['description'] ?? null,
                'discount_type'           => $data['discount_type'],
                'discount_amount'         => $data['discount_amount'],
                'maximum_discount_amount' => $data['maximum_discount_amount'] ?? null,
                'minimum_order_amount'    => $data['minimum_order_amount'],
                'scope'                   => $data['scope'],
                'is_active'               => $data['is_active'],
                'is_public'               => $data['is_public'],
                'usage_limit'             => $data['usage_limit'] ?? null,
                'usage_limit_per_user'    => $data['usage_limit_per_user'] ?? null,
                'valid_from'              => $data['valid_from'] ?? null,
                'valid_until'             => $data['valid_until'] ?? null,
            ]);

            $this->syncScopeRelations($coupon, $data['scope'], $data);

            return $coupon;
        });
    }

    public function updateCoupon(string $id, array $data): Coupon
    {
        return DB::transaction(function () use ($id, $data) {
            $coupon = Coupon::findOrFail($id);

            $coupon->update([
                'code'                    => strtoupper(trim((string) $data['code'])),
                'description'             => $data['description'] ?? null,
                'discount_type'           => $data['discount_type'],
                'discount_amount'         => $data['discount_amount'],
                'maximum_discount_amount' => $data['maximum_discount_amount'] ?? null,
                'minimum_order_amount'    => $data['minimum_order_amount'],
                'scope'                   => $data['scope'],
                'is_active'               => $data['is_active'],
                'is_public'               => $data['is_public'],
                'usage_limit'             => $data['usage_limit'] ?? null,
                'usage_limit_per_user'    => $data['usage_limit_per_user'] ?? null,
                'valid_from'              => $data['valid_from'] ?? null,
                'valid_until'             => $data['valid_until'] ?? null,
            ]);

            $this->syncScopeRelations($coupon, $data['scope'], $data);

            return $coupon;
        });
    }

    public function deleteCoupon(string $id): void
    {
        Coupon::findOrFail($id)->delete();
    }

    public function searchProducts(?string $query = null): array
    {
        [$term, $ids, $isSingleId] = $this->parseSearchInput($query);

        return Product::query()
            ->when(count($ids) > 1, fn($q) => $q->whereIn('id', $ids))
            ->when($isSingleId, fn($q) => $q->where('id', $ids[0]))
            ->when(
                $term !== '' && !$isSingleId && count($ids) <= 1,
                fn($q) => $q->where('name', 'ilike', '%' . $term . '%')
            )
            ->limit(50)
            ->get()
            ->map(fn($p) => [
                'id'    => $p->id,
                'name'  => $p->name,
                'sku'   => $p->sku ?? null,
                'image' => $p->image ?? null,
            ])
            ->toArray();
    }

    public function searchPacks(?string $query = null): array
    {
        [$term, $ids, $isSingleId] = $this->parseSearchInput($query);

        return ProductPack::query()
            ->when(count($ids) > 1, fn($q) => $q->whereIn('id', $ids))
            ->when($isSingleId, fn($q) => $q->where('id', $ids[0]))
            ->when(
                $term !== '' && !$isSingleId && count($ids) <= 1,
                fn($q) => $q->where('name', 'ilike', '%' . $term . '%')
            )
            ->limit(50)
            ->get()
            ->map(fn($p) => [
                'id'    => $p->id,
                'name'  => $p->name,
                'sku'   => null,
                'image' => $p->image ?? null,
            ])
            ->toArray();
    }

    public function searchBusinessDynamics(?string $query = null): array
    {
        [$term, $ids, $isSingleId] = $this->parseSearchInput($query);

        return DynamicCategory::query()
            ->when(count($ids) > 1, fn($q) => $q->whereIn('id', $ids))
            ->when($isSingleId, fn($q) => $q->where('id', $ids[0]))
            ->when(
                $term !== '' && !$isSingleId && count($ids) <= 1,
                fn($q) => $q
                    ->where('is_active', true)
                    ->where('name', 'ilike', '%' . $term . '%')
            )
            ->limit(50)
            ->get()
            ->map(fn($b) => [
                'id'    => $b->id,
                'name'  => $b->name,
                'sku'   => null,
                'image' => null,
            ])
            ->toArray();
    }

    public function searchCustomers(?string $query = null): array
    {
        [$term, $ids, $isSingleId] = $this->parseSearchInput($query);

        return Customer::query()
            ->when(count($ids) > 1, fn($q) => $q->whereIn('id', $ids))
            ->when($isSingleId, fn($q) => $q->where('id', $ids[0]))
            ->when($term !== '' && !$isSingleId && count($ids) <= 1,
                fn($q) => $q
                    ->where('full_name', 'ilike', '%' . $term . '%'))
            ->limit(50)
            ->get()
            ->map(fn($c) => [
                'id'    => $c->id,
                'name'  => $c->full_name,
                'email' => $c->email,
                'photo' => $c->photo ?? null,
            ])
            ->toArray();
    }

    public function searchCategories(?string $query = null): array
    {
        [$term, $ids, $isSingleId] = $this->parseSearchInput($query);

        return ProductCategory::query()
            ->when(count($ids) > 1, fn($q) => $q->whereIn('id', $ids))
            ->when($isSingleId, fn($q) => $q->where('id', $ids[0]))
            ->when(
                $term !== '' && !$isSingleId && count($ids) <= 1,
                fn($q) => $q->where('name', 'ilike', '%' . $term . '%')
            )
            ->limit(50)
            ->get()
            ->map(fn($c) => [
                'id'    => $c->id,
                'name'  => $c->name,
                'sku'   => null,
                'image' => null,
            ])
            ->toArray();
    }

    // ─── Privado ──────────────────────────────────────────────

    private function syncScopeRelations(Coupon $coupon, string $scope, array $data): void
    {
        $map = [
            'product'       => ['relation' => 'products',      'key' => 'product_ids'],
            'category'      => ['relation' => 'categories',    'key' => 'category_ids'],
            'pack'          => ['relation' => 'packs',         'key' => 'pack_ids'],
            'business_dynamic' => ['relation' => 'businessDynamics', 'key' => 'business_dynamic_ids'],
            'customer'      => ['relation' => 'customers',     'key' => 'customer_ids'],
        ];

        foreach ($map as $scopeKey => $config) {
            $relation = $config['relation'];
            $ids      = $data[$config['key']] ?? [];

            if ($scope === $scopeKey) {
                $coupon->$relation()->sync($ids);
            } else {
                $coupon->$relation()->detach();
            }
        }
    }

    private function parseSearchInput(?string $query): array
    {
        $term = trim((string) $query);
        $ids = array_values(array_filter(array_map('trim', explode(',', $term))));
        $isSingleId = count($ids) === 1 && preg_match(self::ULID_REGEX, $ids[0]) === 1;

        return [$term, $ids, $isSingleId];
    }
}
