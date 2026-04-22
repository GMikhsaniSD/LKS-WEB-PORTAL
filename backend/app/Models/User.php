<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes;

    protected $fillable = ['username', 'password', 'role', 'last_login_at', 'delete_reason', 'deleted_at'];
    protected $hidden   = ['password'];
    protected $casts    = [
        'deleted_at'    => 'datetime',
        'last_login_at' => 'datetime',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    public function games()
    {
        return $this->hasMany(Game::class, 'created_by');
    }

    public function scores()
    {
        return $this->hasMany(Score::class);
    }
}
