<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wallet extends Model
{
    protected $fillable = ['user_id', 'balance'];

    protected $casts = ['balance' => 'decimal:2'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
