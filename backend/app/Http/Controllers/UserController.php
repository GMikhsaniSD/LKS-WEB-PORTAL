<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Game;
use App\Models\GameVersion;
use App\Models\Score;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::withTrashed()->get();
        return response()->json([
            'totalElements' => $users->count(),
            'content' => $users->map(fn($u) => [
                'id'           => $u->id,
                'username'     => $u->username,
                'role'         => $u->role,
                'last_login_at'=> $u->last_login_at ? $u->last_login_at->toISOString() : null,
                'created_at'   => $u->created_at ? $u->created_at->toISOString() : null,
                'updated_at'   => $u->updated_at ? $u->updated_at->toISOString() : null,
                'deleted_at'   => $u->deleted_at ? $u->deleted_at->toISOString() : null,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $violations = [];
        if (empty($request->username)) {
            $violations['username'] = ['message' => 'required'];
        } elseif (strlen($request->username) < 4) {
            $violations['username'] = ['message' => 'must be at least 4 characters long'];
        } elseif (strlen($request->username) > 60) {
            $violations['username'] = ['message' => 'must be at most 60 characters long'];
        }

        if (empty($request->password)) {
            $violations['password'] = ['message' => 'required'];
        } elseif (strlen($request->password) < 5) {
            $violations['password'] = ['message' => 'must be at least 5 characters long'];
        } elseif (strlen($request->password) > 10) {
            $violations['password'] = ['message' => 'must be at most 10 characters long'];
        }

        if (!empty($violations)) {
            return response()->json([
                'status' => 'invalid', 'message' => 'Request body is not valid.',
                'violations' => $violations,
            ], 400);
        }

        if (User::withTrashed()->where('username', $request->username)->exists()) {
            return response()->json(['status' => 'invalid', 'message' => 'Username already exists'], 400);
        }

        $role = in_array($request->role, ['dev', 'player']) ? $request->role : 'player';

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role'     => $role,
        ]);

        return response()->json(['status' => 'success', 'username' => $user->username], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::withTrashed()->find($id);

        if (!$user) {
            return response()->json(['status' => 'not-found', 'message' => 'User Not found'], 404);
        }

        $violations = [];
        if (empty($request->username)) {
            $violations['username'] = ['message' => 'required'];
        } elseif (strlen($request->username) < 4) {
            $violations['username'] = ['message' => 'must be at least 4 characters long'];
        } elseif (strlen($request->username) > 60) {
            $violations['username'] = ['message' => 'must be at most 60 characters long'];
        }

        if (empty($request->password)) {
            $violations['password'] = ['message' => 'required'];
        } elseif (strlen($request->password) < 5) {
            $violations['password'] = ['message' => 'must be at least 5 characters long'];
        } elseif (strlen($request->password) > 10) {
            $violations['password'] = ['message' => 'must be at most 10 characters long'];
        }

        if (!empty($violations)) {
            return response()->json([
                'status' => 'invalid', 'message' => 'Request body is not valid.',
                'violations' => $violations,
            ], 400);
        }

        $existingUser = User::withTrashed()
            ->where('username', $request->username)
            ->where('id', '!=', $id)
            ->exists();

        if ($existingUser) {
            return response()->json(['status' => 'invalid', 'message' => 'Username already exists'], 400);
        }

        $updateData = [
            'username' => $request->username,
            'password' => Hash::make($request->password),
        ];

        if ($request->has('role') && in_array($request->role, ['dev', 'player'])) {
            $updateData['role'] = $request->role;
        }

        $user->update($updateData);

        return response()->json(['status' => 'success', 'username' => $user->username], 201);
    }

    public function destroy(Request $request, $id)
    {
        // Soft delete + simpan alasan blokir
        $user = User::find($id);

        if (!$user) {
            return response()->json(['status' => 'not-found', 'message' => 'User Not found'], 403);
        }

        $user->update([
            'deleted_at'    => now(),
            'delete_reason' => $request->input('reason', 'You have been blocked by an administrator'),
        ]);

        return response()->noContent(); // 204
    }

    public function unlock($id)
    {
        $user = User::withTrashed()->find($id);
        if (!$user) {
            return response()->json(['status' => 'not-found', 'message' => 'User Not found'], 404);
        }

        $user->restore();
        $user->update(['delete_reason' => null]);

        return response()->json(['status' => 'success']);
    }

    public function show(Request $request, $username)
    {
        $profileUser = User::where('username', $username)->first();

        if (!$profileUser) {
            return response()->json(['status' => 'not-found', 'message' => 'Not found'], 404);
        }

        $isSelf = $request->user() && $request->user()->id === $profileUser->id;

        // Authored games
        $gamesQuery = Game::where('created_by', $profileUser->id)->whereNull('deleted_at');

        if (!$isSelf) {
            // Kalau bukan user sendiri, filter game yg punya versi aja
            $gamesQuery->whereHas('versions', fn($q) => $q->whereNull('deleted_at'));
        }

        $authoredGames = $gamesQuery->get()->map(function ($g) {
            $latestVersion = GameVersion::where('game_id', $g->id)
                ->whereNull('deleted_at')
                ->orderByRaw("CAST(SUBSTRING(version, 2) AS UNSIGNED) DESC")
                ->first();

            $thumbnail = null;
            $customThumbPath = public_path("games/{$g->id}/custom_thumbnail.png");
            $cacheBuster = '';
            
            if (file_exists($customThumbPath)) {
                $cacheBuster = '?t=' . filemtime($customThumbPath);
                $thumbnail = "/games/{$g->slug}/custom_thumbnail" . $cacheBuster;
            } elseif ($latestVersion) {
                $baseThumbPath = public_path("games/{$g->id}/{$latestVersion->version}/");
                $candidates = ['thumbnail.png', 'thumbnail.jpg', 'thumbnail.jpeg', 'thumbnail.gif', 'thumbnail'];
                foreach ($candidates as $cand) {
                    if (file_exists($baseThumbPath . $cand)) {
                        $thumbnail = "/games/{$g->slug}/{$latestVersion->version}/{$cand}";
                        break;
                    }
                }
            }

            return [
                'slug'        => $g->slug,
                'title'       => $g->title,
                'description' => $g->description,
                'thumbnail'   => $thumbnail,
                '_latestTs'   => $latestVersion ? $latestVersion->created_at->timestamp : 0,
            ];
        })->sortByDesc('_latestTs')->values()->map(function ($item) {
            unset($item['_latestTs']);
            return $item;
        });

        // Highscores per game
        $highscores = DB::select("
            SELECT g.slug, g.title, g.description,
                   s.score, s.created_at as timestamp
            FROM scores s
            JOIN game_versions gv ON s.game_version_id = gv.id
            JOIN games g ON gv.game_id = g.id
            WHERE s.user_id = ? AND g.deleted_at IS NULL
            AND s.id = (
                SELECT s2.id FROM scores s2
                JOIN game_versions gv2 ON s2.game_version_id = gv2.id
                WHERE gv2.game_id = g.id AND s2.user_id = s.user_id
                ORDER BY s2.score DESC, s2.created_at DESC
                LIMIT 1
            )
            ORDER BY g.title ASC
        ", [$profileUser->id]);

        $highscoresMapped = array_map(fn($h) => [
            'game' => [
                'slug'        => $h->slug,
                'title'       => $h->title,
                'description' => $h->description,
            ],
            'score'     => (float) $h->score,
            'timestamp' => \Carbon\Carbon::parse($h->timestamp)->toISOString(),
        ], $highscores);

        return response()->json([
            'username'           => $profileUser->username,
            'registeredTimestamp'=> $profileUser->created_at ? $profileUser->created_at->toISOString() : null,
            'authoredGames'      => $authoredGames,
            'highscores'         => $highscoresMapped,
        ]);
    }
}
