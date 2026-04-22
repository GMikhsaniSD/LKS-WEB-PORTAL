<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Game;
use App\Models\GameVersion;
use App\Models\Score;
use Laravel\Sanctum\PersonalAccessToken;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $page    = (int) $request->get('page', 0);
        $size    = (int) $request->get('size', 10);
        $sortBy  = $request->get('sortBy', 'title');
        $sortDir = strtolower($request->get('sortDir', 'asc')) === 'desc' ? 'desc' : 'asc';

        // Hanya tampilkan game yang punya versi aktif
        $query = Game::whereNull('games.deleted_at')
            ->whereExists(function ($q) {
                $q->select(DB::raw(1))
                  ->from('game_versions')
                  ->whereColumn('game_versions.game_id', 'games.id')
                  ->whereNull('game_versions.deleted_at');
            })
            ->join('users', 'games.created_by', '=', 'users.id')
            ->whereNull('users.deleted_at')
            ->select('games.*', 'users.username as author_username');

        $totalCount = (clone $query)->count('games.id');


        if ($sortBy === 'popular') {
            $query->leftJoin('game_versions as gv_pop', function($j) {
                $j->on('gv_pop.game_id', '=', 'games.id')->whereNull('gv_pop.deleted_at');
            })
            ->leftJoin('scores as s_pop', 's_pop.game_version_id', '=', 'gv_pop.id')
            ->groupBy('games.id', 'users.username')
            ->orderBy(DB::raw('COUNT(s_pop.id)'), $sortDir);
        } elseif ($sortBy === 'uploaddate') {
            $query->orderBy(DB::raw('(
                SELECT created_at FROM game_versions
                WHERE game_id = games.id AND deleted_at IS NULL
                ORDER BY CAST(SUBSTRING(version, 2) AS UNSIGNED) DESC
                LIMIT 1
            )'), $sortDir);
        } else {
            $query->orderBy('games.title', $sortDir);
        }

        $games   = $query->skip($page * $size)->take($size)->get();

        $content = $games->map(function ($game) {
            $latestVersion = GameVersion::where('game_id', $game->id)
                ->whereNull('deleted_at')
                ->orderByRaw("CAST(SUBSTRING(version, 2) AS UNSIGNED) DESC")
                ->first();

            $scoreCount = Score::whereIn('game_version_id',
                GameVersion::withTrashed()->where('game_id', $game->id)->pluck('id')
            )->count();

            $thumbnail = null;
            $customThumbPath = public_path("games/{$game->id}/custom_thumbnail.png");
            if (file_exists($customThumbPath)) {
                $cacheBuster = '?t=' . filemtime($customThumbPath);
                $thumbnail = "/games/{$game->slug}/custom_thumbnail" . $cacheBuster;
            } elseif ($latestVersion) {
                $baseThumbPath = public_path("games/{$game->id}/{$latestVersion->version}/");
                $candidates = ['thumbnail.png', 'thumbnail.jpg', 'thumbnail.jpeg', 'thumbnail.gif', 'thumbnail'];
                foreach ($candidates as $cand) {
                    if (file_exists($baseThumbPath . $cand)) {
                        $thumbnail = "/games/{$game->slug}/{$latestVersion->version}/{$cand}";
                        break;
                    }
                }
            }

            return [
                'slug'            => $game->slug,
                'title'           => $game->title,
                'description'     => $game->description,
                'thumbnail'       => $thumbnail,
                'uploadTimestamp' => $latestVersion
                    ? $latestVersion->created_at->toISOString()
                    : null,
                'author'          => $game->author_username,
                'scoreCount'      => $scoreCount,
            ];
        });

        return response()->json([
            'page'          => $page,
            'size'          => $content->count(),
            'totalElements' => $totalCount,
            'content'       => $content,
        ]);
    }

    public function show($slug)
    {
        $game = Game::whereNull('deleted_at')->where('slug', $slug)
            ->whereHas('author')
            ->with('author')
            ->first();

        if (!$game) {
            return response()->json(['status' => 'not-found', 'message' => 'Not found'], 404);
        }

        $latestVersion = GameVersion::where('game_id', $game->id)
            ->whereNull('deleted_at')
            ->orderByRaw("CAST(SUBSTRING(version, 2) AS UNSIGNED) DESC")
            ->first();

        $scoreCount = Score::whereIn('game_version_id',
            GameVersion::withTrashed()->where('game_id', $game->id)->pluck('id')
        )->count();

        $thumbnail = null;
        $gamePath = null;
        $customThumbPath = public_path("games/{$game->id}/custom_thumbnail.png");
        if (file_exists($customThumbPath)) {
            $cacheBuster = '?t=' . filemtime($customThumbPath);
            $thumbnail = "/games/{$game->slug}/custom_thumbnail" . $cacheBuster;
            if ($latestVersion) {
                $gamePath = "/games/{$game->slug}/{$latestVersion->version}/";
            }
        } elseif ($latestVersion) {
            $baseThumbPath = public_path("games/{$game->id}/{$latestVersion->version}/");
            $candidates = ['thumbnail.png', 'thumbnail.jpg', 'thumbnail.jpeg', 'thumbnail.gif', 'thumbnail'];
            foreach ($candidates as $cand) {
                if (file_exists($baseThumbPath . $cand)) {
                    $thumbnail = "/games/{$game->slug}/{$latestVersion->version}/{$cand}";
                    break;
                }
            }
            $gamePath = "/games/{$game->slug}/{$latestVersion->version}/";
        }

        return response()->json([
            'slug'            => $game->slug,
            'title'           => $game->title,
            'description'     => $game->description,
            'thumbnail'       => $thumbnail,
            'uploadTimestamp' => $latestVersion ? $latestVersion->created_at->toISOString() : null,
            'author'          => $game->author->username,
            'scoreCount'      => $scoreCount,
            'gamePath'        => $gamePath,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'dev') {
            return response()->json(['status' => 'forbidden', 'message' => 'Only developers can manage games'], 403);
        }

        $violations = [];
        if (empty($request->title)) {
            $violations['title'] = ['message' => 'required'];
        } elseif (strlen($request->title) < 3) {
            $violations['title'] = ['message' => 'must be at least 3 characters long'];
        } elseif (strlen($request->title) > 60) {
            $violations['title'] = ['message' => 'must be at most 60 characters long'];
        }

        if (!isset($request->description)) {
            $violations['description'] = ['message' => 'required'];
        } elseif (strlen($request->description) > 200) {
            $violations['description'] = ['message' => 'must be at most 200 characters long'];
        }

        if (!empty($violations)) {
            return response()->json([
                'status' => 'invalid', 'message' => 'Request body is not valid.',
                'violations' => $violations,
            ], 400);
        }

        $slug = Str::slug($request->title);

        if (Game::withTrashed()->where('slug', $slug)->exists()) {
            return response()->json([
                'status' => 'invalid',
                'slug'   => 'Game title already exists',
            ], 400);
        }

        $game = Game::create([
            'title'       => $request->title,
            'slug'        => $slug,
            'description' => $request->description,
            'created_by'  => $request->user()->id,
        ]);

        return response()->json(['status' => 'success', 'slug' => $game->slug], 201);
    }

    public function update(Request $request, $slug)
    {
        $game = Game::whereNull('deleted_at')->where('slug', $slug)->first();

        if (!$game) {
            return response()->json(['status' => 'not-found', 'message' => 'Not found'], 404);
        }

        if ($game->created_by !== $request->user()->id) {
            return response()->json([
                'status'  => 'forbidden',
                'message' => 'You are not the game author',
            ], 403);
        }

        // Validasi input update
        $violations = [];
        if (isset($request->title)) {
            if (strlen($request->title) < 3) {
                $violations['title'] = ['message' => 'must be at least 3 characters long'];
            } elseif (strlen($request->title) > 60) {
                $violations['title'] = ['message' => 'must be at most 60 characters long'];
            }
        }
        if (isset($request->description) && strlen($request->description) > 200) {
            $violations['description'] = ['message' => 'must be at most 200 characters long'];
        }
        if (!empty($violations)) {
            return response()->json([
                'status' => 'invalid', 'message' => 'Request body is not valid.',
                'violations' => $violations,
            ], 400);
        }

        $game->update([
            'title'       => $request->title ?? $game->title,
            'description' => $request->description ?? $game->description,
        ]);

        return response()->json(['status' => 'success']);
    }

    public function destroy(Request $request, $slug)
    {
        $game = Game::whereNull('deleted_at')->where('slug', $slug)->first();

        if (!$game) {
            return response()->json(['status' => 'not-found', 'message' => 'Not found'], 404);
        }

        if ($game->created_by !== $request->user()->id) {
            return response()->json([
                'status'  => 'forbidden',
                'message' => 'You are not the game author',
            ], 403);
        }

        // Hapus scores & versions, lalu soft-delete game
        $versionIds = GameVersion::withTrashed()->where('game_id', $game->id)->pluck('id');
        DB::transaction(function () use ($game, $versionIds) {
            Score::whereIn('game_version_id', $versionIds)->delete();
            GameVersion::withTrashed()->where('game_id', $game->id)->forceDelete();

            // Reset slug supaya bisa dipakai ulang
            $game->slug = $game->slug . '-deleted-' . time();
            $game->save();

            $game->delete();
        });

        return response()->noContent(); // 204
    }

    public function upload(Request $request, $slug)
    {
        // Token dikirim via form-data, bukan header
        $tokenValue = $request->input('token');
        if (!$tokenValue) {
            return response('Missing token', 401);
        }

        $accessToken = PersonalAccessToken::findToken($tokenValue);
        if (!$accessToken) {
            return response('Invalid token', 401);
        }

        $user = $accessToken->tokenable;

        $game = Game::whereNull('deleted_at')->where('slug', $slug)->first();
        if (!$game) {
            return response('Game not found', 404);
        }

        if ($game->created_by !== $user->id) {
            return response('User is not author of the game', 403);
        }

        if (!$request->hasFile('zipfile')) {
            return response('No file uploaded', 400);
        }

        $zipFile = $request->file('zipfile');
        
        // Validasi file ZIP
        $allowedMimes = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];
        if (!in_array($zipFile->getMimeType(), $allowedMimes) || $zipFile->getClientOriginalExtension() !== 'zip') {
            return response('File must be a valid ZIP archive', 400);
        }

        // Hitung versi baru
        $lastVersionNum = GameVersion::where('game_id', $game->id)
            ->withTrashed()
            ->get()
            ->map(fn($v) => (int) ltrim($v->version, 'v'))
            ->max() ?? 0;

        $newVersionNum = $lastVersionNum + 1;
        $newVersion    = 'v' . $newVersionNum;
        $storagePath   = "games/{$game->id}/{$newVersion}/";
        $targetDir     = public_path($storagePath);

        // Extract ZIP
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $zip     = new \ZipArchive();

        if ($zip->open($zipFile->getPathname()) === true) {
            $zip->extractTo($targetDir);
            $zip->close();

            // Kalau isinya cuma 1 folder, pindahkan isinya ke root
            $scanned = array_diff(scandir($targetDir), ['..', '.']);
            if (count($scanned) === 1) {
                $firstItem = reset($scanned);
                $nestedDir = $targetDir . '/' . $firstItem;
                if (is_dir($nestedDir)) {
                    $nestedItems = array_diff(scandir($nestedDir), ['..', '.']);
                    foreach ($nestedItems as $item) {
                        rename($nestedDir . '/' . $item, $targetDir . '/' . $item);
                    }
                    rmdir($nestedDir);
                }
            }
        } else {
            return response('Failed to extract zip file', 500);
        }

        // Simpan versi baru ke DB
        GameVersion::create([
            'game_id'      => $game->id,
            'version'      => $newVersion,
            'storage_path' => $storagePath,
        ]);

        return response()->json(['status' => 'success'], 201);
    }

    public function serveGameFile($slug, $version, $file = 'index.html')
    {
        $game = Game::whereHas('author')->where('slug', $slug)->first();
        if (!$game) {
            abort(404);
        }

        $filePath = public_path("games/{$game->id}/{$version}/{$file}");
        if (!file_exists($filePath)) {
            abort(404);
        }

        return response()->file($filePath);
    }

    public function uploadThumbnail(Request $request, $slug)
    {
        $tokenValue = $request->input('token');
        if (!$tokenValue) return response('Missing token', 401);
        
        $accessToken = PersonalAccessToken::findToken($tokenValue);
        if (!$accessToken) return response('Invalid token', 401);
        $user = $accessToken->tokenable;

        $game = Game::whereNull('deleted_at')->where('slug', $slug)->first();
        if (!$game) return response('Game not found', 404);
        if ($game->created_by !== $user->id) return response('Forbidden', 403);

        if (!$request->hasFile('thumbnail')) return response('No thumbnail uploaded', 400);

        $file = $request->file('thumbnail');
        if (!str_starts_with($file->getMimeType(), 'image/')) return response('File must be an image', 400);

        $targetDir = public_path("games/{$game->id}");
        if (!is_dir($targetDir)) mkdir($targetDir, 0755, true);

        $file->move($targetDir, 'custom_thumbnail.png');
        return response()->json(['status' => 'success']);
    }

    public function serveCustomThumbnail($slug)
    {
        $game = Game::whereHas('author')->where('slug', $slug)->first();
        if (!$game) abort(404);

        $filePath = public_path("games/{$game->id}/custom_thumbnail.png");
        if (!file_exists($filePath)) abort(404);

        return response()->file($filePath);
    }
}
