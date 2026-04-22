<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Game extends Model
{
    use SoftDeletes;

    protected $fillable = ['title', 'slug', 'description', 'created_by'];

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function versions()
    {
        return $this->hasMany(GameVersion::class);
    }

    public function latestVersion()
    {
        return $this->hasOne(GameVersion::class)
            ->whereNull('deleted_at')
            ->orderByRaw("CAST(SUBSTRING(version, 2) AS UNSIGNED) DESC");
    }

    public function scores()
    {
        return $this->hasManyThrough(Score::class, GameVersion::class);
    }
}
