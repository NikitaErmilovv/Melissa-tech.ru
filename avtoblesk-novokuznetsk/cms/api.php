<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$root = dirname(__DIR__);
$cmsDir = __DIR__;
$contentFile = $cmsDir . '/content.json';
$configLocal = $cmsDir . '/config.local.json';
$configExample = $cmsDir . '/config.example.json';
$sessionsFile = $cmsDir . '/_sessions.json';
$uploadsDir = $root . '/img/cms/uploads';

const TOKEN_TTL = 86400;

function send_json(int $code, array $payload): void {
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function cms_password(): string {
    global $configLocal, $configExample;
    foreach ([$configLocal, $configExample] as $path) {
        if (!is_file($path)) {
            continue;
        }
        $data = json_decode((string) file_get_contents($path), true);
        if (is_array($data) && !empty($data['password'])) {
            return trim((string) $data['password']);
        }
    }
    return '';
}

function load_sessions(): array {
    global $sessionsFile;
    if (!is_file($sessionsFile)) {
        return [];
    }
    $data = json_decode((string) file_get_contents($sessionsFile), true);
    return is_array($data) ? $data : [];
}

function save_sessions(array $sessions): void {
    global $sessionsFile;
    file_put_contents($sessionsFile, json_encode($sessions, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
}

function bearer_token(): ?string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (stripos($header, 'Bearer ') === 0) {
        return trim(substr($header, 7));
    }
    return null;
}

function check_token(?string $token): bool {
    if (!$token) {
        return false;
    }
    $sessions = load_sessions();
    $exp = $sessions[$token] ?? null;
    if (!$exp || time() > (int) $exp) {
        unset($sessions[$token]);
        save_sessions($sessions);
        return false;
    }
    return true;
}

function read_content(): array {
    global $contentFile;
    if (!is_file($contentFile)) {
        return [];
    }
    $data = json_decode((string) file_get_contents($contentFile), true);
    return is_array($data) ? $data : [];
}

function write_content(array $data): void {
    global $contentFile;
    file_put_contents($contentFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($action === 'login' && $method === 'POST') {
    $body = json_decode((string) file_get_contents('php://input'), true);
    $pwd = is_array($body) ? trim((string) ($body['password'] ?? '')) : '';
    $expected = cms_password();
    if ($expected === '' || !hash_equals($expected, $pwd)) {
        send_json(401, ['error' => 'Unauthorized']);
    }
    $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    $sessions = load_sessions();
    $sessions[$token] = time() + TOKEN_TTL;
    save_sessions($sessions);
    send_json(200, ['token' => $token]);
}

if ($action === 'save' && $method === 'POST') {
    if (!check_token(bearer_token())) {
        send_json(401, ['error' => 'Unauthorized']);
    }
    $payload = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        send_json(400, ['error' => 'Bad JSON']);
    }
    $page = (string) ($payload['page'] ?? '');
    if ($page === '') {
        send_json(400, ['error' => 'Missing page']);
    }
    $store = read_content();
    $store[$page] = $store[$page] ?? ['text' => [], 'images' => [], 'backgrounds' => []];
    if (isset($payload['text']) && is_array($payload['text'])) {
        $store[$page]['text'] = array_merge($store[$page]['text'] ?? [], $payload['text']);
    }
    if (isset($payload['images']) && is_array($payload['images'])) {
        $store[$page]['images'] = array_merge($store[$page]['images'] ?? [], $payload['images']);
    }
    if (isset($payload['backgrounds']) && is_array($payload['backgrounds'])) {
        $store[$page]['backgrounds'] = array_merge($store[$page]['backgrounds'] ?? [], $payload['backgrounds']);
    }
    if (array_key_exists('hiddenBlocks', $payload) && is_array($payload['hiddenBlocks'])) {
        $store[$page]['hiddenBlocks'] = $payload['hiddenBlocks'];
    }
    if (isset($payload['lists']) && is_array($payload['lists'])) {
        $store[$page]['lists'] = $payload['lists'];
    }
    if (isset($payload['meta']) && is_array($payload['meta'])) {
        $clean = static function ($value, int $limit): string {
            $text = trim(preg_replace('/\s+/u', ' ', strip_tags((string) $value)) ?? '');
            if (function_exists('mb_substr')) {
                return mb_substr($text, 0, $limit);
            }
            return substr($text, 0, $limit);
        };
        $store[$page]['meta'] = [
            'title' => $clean($payload['meta']['title'] ?? '', 180),
            'description' => $clean($payload['meta']['description'] ?? '', 320),
        ];
    }
    write_content($store);
    send_json(200, ['ok' => true]);
}

if ($action === 'upload' && $method === 'POST') {
    if (!check_token(bearer_token())) {
        send_json(401, ['error' => 'Unauthorized']);
    }
    if (empty($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
        send_json(400, ['error' => 'No file']);
    }
    $file = $_FILES['file'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm'];
    if (!in_array($ext, $allowed, true)) {
        send_json(400, ['error' => 'Bad type']);
    }
    if (!is_dir($uploadsDir) && !mkdir($uploadsDir, 0775, true) && !is_dir($uploadsDir)) {
        send_json(500, ['error' => 'Upload dir']);
    }
    $name = 'cms-' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest = $uploadsDir . '/' . $name;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        send_json(500, ['error' => 'Move failed']);
    }
    send_json(200, ['url' => 'img/cms/uploads/' . $name]);
}

if ($action === 'reviews-2gis' && $method === 'GET') {
    $cacheFile = dirname(__DIR__) . '/data/reviews-2gis.json';
    $url = 'https://api.reviews.2gis.com/2.0/branches/70000001098503533/reviews?key=d463a78e-4d44-4198-8cd5-7fc0762032cb&limit=50&offset=0&sort_by=date_created';
    $ctx = stream_context_create(['http' => ['timeout' => 20, 'header' => "Accept: application/json\r\nUser-Agent: AvtobleskSite/1.0\r\n"]]);
    $items = [];
    $offset = 0;
    for ($i = 0; $i < 3; $i++) {
        $raw = @file_get_contents(str_replace('offset=0', 'offset=' . $offset, $url), false, $ctx);
        if ($raw === false) {
            break;
        }
        $data = json_decode($raw, true);
        $page = $data['reviews'] ?? [];
        if (!$page) {
            break;
        }
        foreach ($page as $rev) {
            if (!empty($rev['is_hidden']) || empty($rev['rating'])) {
                continue;
            }
            $user = $rev['user'] ?? [];
            $iso = $rev['date_created'] ?? '';
            $date = $iso ? date('j.m.Y', strtotime($iso)) : '';
            $items[] = [
                'name' => trim($user['name'] ?? ($user['first_name'] ?? 'Клиент')),
                'text' => trim((string)($rev['text'] ?? '')) ?: 'Без текста',
                'rating' => (int)$rev['rating'],
                'date' => $date,
                'id' => (string)($rev['id'] ?? ''),
            ];
        }
        if (empty($data['meta']['next_link'])) {
            break;
        }
        $offset += 50;
    }
    if ($items) {
        @file_put_contents($cacheFile, json_encode($items, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n");
        send_json(200, $items);
    }
    if (is_file($cacheFile)) {
        $cached = json_decode((string)file_get_contents($cacheFile), true);
        if (is_array($cached)) {
            send_json(200, $cached);
        }
    }
    send_json(502, ['error' => '2gis']);
}

if ($action === 'wrap-zones-save' && $method === 'POST') {
    if (!check_token(bearer_token())) {
        send_json(401, ['error' => 'Unauthorized']);
    }
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    $hasZones = isset($payload['zones']) && is_array($payload['zones']);
    $hasModels = isset($payload['models']) && is_array($payload['models']);
    if (!is_array($payload) || (!$hasZones && !$hasModels)) {
        send_json(400, ['error' => 'Missing zones']);
    }
    $path = dirname(__DIR__) . '/data/wrap-zones.json';
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n";
    $fp = fopen($path, 'c+');
    if ($fp === false || !flock($fp, LOCK_EX)) {
        if (is_resource($fp)) {
            fclose($fp);
        }
        send_json(500, ['error' => 'Write failed']);
    }
    ftruncate($fp, 0);
    rewind($fp);
    $written = fwrite($fp, $json);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    if ($written === false) {
        send_json(500, ['error' => 'Write failed']);
    }
    send_json(200, ['ok' => true]);
}

if ($action === 'training-save' && $method === 'POST') {
    if (!check_token(bearer_token())) {
        send_json(401, ['error' => 'Unauthorized']);
    }
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (!is_array($payload) || !isset($payload['students']) || !is_array($payload['students'])) {
        send_json(400, ['error' => 'Missing students']);
    }
    $path = dirname(__DIR__) . '/data/training.json';
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n";
    if (file_put_contents($path, $json) === false) {
        send_json(500, ['error' => 'Write failed']);
    }
    send_json(200, ['ok' => true]);
}

send_json(404, ['error' => 'Not found']);
