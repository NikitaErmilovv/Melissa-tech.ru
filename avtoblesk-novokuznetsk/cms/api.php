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
            return (string) $data['password'];
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
    $pwd = is_array($body) ? (string) ($body['password'] ?? '') : '';
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
    if (isset($payload['lists']) && is_array($payload['lists'])) {
        $store[$page]['lists'] = $payload['lists'];
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

send_json(404, ['error' => 'Not found']);
