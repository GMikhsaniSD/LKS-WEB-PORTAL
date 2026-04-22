<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::withTrashed()->find(2);
echo "User: " . ($user ? $user->username : 'null') . "\n";
if ($user) {
    if ($user->trashed()) {
        echo "User is trashed. Restoring...\n";
        $user->restore();
        $user->update(['delete_reason' => null]);
        echo "Done.\n";
    } else {
        echo "User is not trashed.\n";
    }
}
