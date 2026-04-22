<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Game;
use App\Models\GameVersion;
use App\Models\Score;

class ScoreController extends Controller
{
    public function index($slug)
    {
        $game = Game::whereNull('deleted_at')->where('slug', $slug)->whereHas('author')->first();
        if (!$game) {
            return response()->json(['status' => 'not-found', 'message' => 'Not found'], 404);
        }

        // Best score per user
        $scores = DB::select("
            SELECT u.username, s.score, s.created_at as timestamp
            FROM scores s
            JOIN users u ON s.user_id = u.id
            JOIN game_versions gv ON s.game_version_id = gv.id
            WHERE gv.game_id = ?
            AND s.id = (
                SELECT s2.id FROM scores s2
                JOIN game_versions gv2 ON s2.game_version_id = gv2.id
                WHERE gv2.game_id = ? AND s2.user_id = s.user_id
                ORDER BY s2.score DESC, s2.created_at DESC
                LIMIT 1
            )
            ORDER BY s.score DESC
        ", [$game->id, $game->id]);

        $result = array_map(fn($s) => [
            'username'  => $s->username,
            'score'     => (float) $s->score,
            'timestamp' => \Carbon\Carbon::parse($s->timestamp)->toISOString(),
        ], $scores);

        return response()->json(['scores' => $result]);
    }

    public function store(Request $request, $slug)
    {
        $game = Game::whereNull('deleted_at')->where('slug', $slug)->whereHas('author')->first();
        if (!$game) {
            return response()->json(['status' => 'not-found', 'message' => 'Not found'], 404);
        }

        if (!isset($request->score)) {
            return response()->json([
                'status' => 'invalid', 'message' => 'Request body is not valid.',
                'violations' => ['score' => ['message' => 'required']],
            ], 400);
        }

        if (!is_numeric($request->score)) {
            return response()->json([
                'status' => 'invalid', 'message' => 'Request body is not valid.',
                'violations' => ['score' => ['message' => 'must be a valid number']],
            ], 400);
        }

        // Ambil versi terbaru
        $latestVersion = GameVersion::where('game_id', $game->id)
            ->whereNull('deleted_at')
            ->orderByRaw("CAST(SUBSTRING(version, 2) AS UNSIGNED) DESC")
            ->first();

        if (!$latestVersion) {
            return response()->json(['status' => 'not-found', 'message' => 'Not found'], 404);
        }

        Score::create([
            'user_id'         => $request->user()->id,
            'game_version_id' => $latestVersion->id,
            'score'           => $request->score,
        ]);

        return response()->json(['status' => 'success'], 201);
    }
}
