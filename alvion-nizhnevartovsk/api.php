<?php
header('Content-Type: application/json; charset=utf-8');

const ADMIN_EMAIL = 'admin@alvion.ru';
const ADMIN_PASSWORD = 'alvion123';
const SESSION_TTL = 60 * 60 * 24 * 14;

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . '_data';
$usersFile = $dataDir . DIRECTORY_SEPARATOR . 'users.json';
$appsFile = $dataDir . DIRECTORY_SEPARATOR . 'applications.json';
$sessionsFile = $dataDir . DIRECTORY_SEPARATOR . 'sessions.json';

function send_json(int $status, $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function load_json(string $path, $default) {
    if (!is_file($path)) {
        return $default;
    }
    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    return $data === null ? $default : $data;
}

function save_json(string $path, $data): void {
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        send_json(500, ['error' => 'Нет прав на запись данных. Нужен хостинг с PHP и папкой _data.']);
    }
    $ok = file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
    if ($ok === false) {
        send_json(500, ['error' => 'Не удалось сохранить данные. Проверьте права на папку _data.']);
    }
}

function hash_password(string $password): string {
    return hash('sha256', $password);
}

function uid(): string {
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    $hex = bin2hex($b);
    return substr($hex, 0, 8) . '-' . substr($hex, 8, 4) . '-' . substr($hex, 12, 4) . '-' . substr($hex, 16, 4) . '-' . substr($hex, 20, 12);
}

function public_user(array $user): array {
    return [
        'id' => $user['id'] ?? null,
        'name' => $user['name'] ?? '',
        'phone' => $user['phone'] ?? '',
        'email' => $user['email'] ?? '',
        'role' => $user['role'] ?? 'user',
    ];
}

function create_session(string $userId): string {
    global $sessionsFile;
    $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    $sessions = load_json($sessionsFile, []);
    if (!is_array($sessions)) {
        $sessions = [];
    }
    $sessions[$token] = [
        'userId' => $userId,
        'expiresAt' => time() + SESSION_TTL,
    ];
    save_json($sessionsFile, $sessions);
    return $token;
}

function bearer_token(): ?string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (stripos($header, 'Bearer ') === 0) {
        return trim(substr($header, 7));
    }
    return null;
}

function current_user(): ?array {
    global $sessionsFile, $usersFile;
    $token = bearer_token();
    if (!$token) {
        return null;
    }
    $sessions = load_json($sessionsFile, []);
    if (!is_array($sessions) || empty($sessions[$token])) {
        return null;
    }
    $session = $sessions[$token];
    if ((float)($session['expiresAt'] ?? 0) < time()) {
        unset($sessions[$token]);
        save_json($sessionsFile, $sessions);
        return null;
    }
    $users = load_json($usersFile, []);
    foreach ($users as $user) {
        if (($user['id'] ?? null) === ($session['userId'] ?? null)) {
            return $user;
        }
    }
    return null;
}

function read_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        send_json(400, ['error' => 'Некорректный JSON']);
    }
    return $data;
}

function ensure_seed(): void {
    global $usersFile, $appsFile, $sessionsFile;
    $users = load_json($usersFile, []);
    if (!is_array($users)) {
        $users = [];
    }
    $hasAdmin = false;
    foreach ($users as $user) {
        if (($user['email'] ?? '') === ADMIN_EMAIL) {
            $hasAdmin = true;
            break;
        }
    }
    if (!$hasAdmin) {
        $users[] = [
            'id' => uid(),
            'name' => 'Администратор',
            'phone' => '+7 (922) 420-02-38',
            'email' => ADMIN_EMAIL,
            'passwordHash' => hash_password(ADMIN_PASSWORD),
            'role' => 'admin',
            'createdAt' => gmdate('Y-m-d\TH:i:s\Z'),
        ];
        save_json($usersFile, $users);
    }
    if (!is_file($appsFile)) {
        save_json($appsFile, []);
    }
    if (!is_file($sessionsFile)) {
        save_json($sessionsFile, (object)[]);
    }
}

$path = $_GET['path'] ?? ($_SERVER['PATH_INFO'] ?? '');
$path = '/' . ltrim(str_replace('\\', '/', $path), '/');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

ensure_seed();

if ($method === 'GET' && $path === '/api/auth/me') {
    $user = current_user();
    if (!$user) {
        send_json(401, ['error' => 'Требуется авторизация']);
    }
    send_json(200, ['user' => public_user($user)]);
}

if ($method === 'GET' && $path === '/api/applications/mine') {
    $user = current_user();
    if (!$user) {
        send_json(401, ['error' => 'Требуется авторизация']);
    }
    $apps = load_json($appsFile, []);
    $mine = array_values(array_filter($apps, function ($item) use ($user) {
        return ($item['userId'] ?? null) === ($user['id'] ?? null);
    }));
    usort($mine, function ($a, $b) {
        return strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? '');
    });
    send_json(200, ['items' => $mine]);
}

if ($method === 'GET' && $path === '/api/admin/applications') {
    $user = current_user();
    if (!$user || ($user['role'] ?? '') !== 'admin') {
        send_json(403, ['error' => 'Доступ только для администратора']);
    }
    $apps = load_json($appsFile, []);
    $users = [];
    foreach (load_json($usersFile, []) as $item) {
        $users[$item['id'] ?? ''] = $item;
    }
    usort($apps, function ($a, $b) {
        return strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? '');
    });
    $items = [];
    foreach ($apps as $app) {
        $owner = $users[$app['userId'] ?? ''] ?? [];
        $items[] = array_merge($app, [
            'userName' => $owner['name'] ?? '—',
            'userPhone' => $owner['phone'] ?? '—',
            'userEmail' => $owner['email'] ?? '—',
        ]);
    }
    send_json(200, ['items' => $items]);
}

if ($method === 'POST' && $path === '/api/auth/register') {
    $data = read_body();
    $name = trim((string)($data['name'] ?? ''));
    $phone = trim((string)($data['phone'] ?? ''));
    $email = strtolower(trim((string)($data['email'] ?? '')));
    $password = (string)($data['password'] ?? '');
    if (mb_strlen($name) < 2) {
        send_json(400, ['error' => 'Укажите имя.']);
    }
    if ($email === '' || strpos($email, '@') === false) {
        send_json(400, ['error' => 'Укажите корректный email.']);
    }
    if (strlen($password) < 6) {
        send_json(400, ['error' => 'Пароль — минимум 6 символов.']);
    }
    $users = load_json($usersFile, []);
    foreach ($users as $item) {
        if (($item['email'] ?? '') === $email) {
            send_json(409, ['error' => 'Пользователь с таким email уже зарегистрирован.']);
        }
    }
    $user = [
        'id' => uid(),
        'name' => $name,
        'phone' => $phone,
        'email' => $email,
        'passwordHash' => hash_password($password),
        'role' => 'user',
        'createdAt' => gmdate('Y-m-d\TH:i:s\Z'),
    ];
    $users[] = $user;
    save_json($usersFile, $users);
    send_json(201, ['token' => create_session($user['id']), 'user' => public_user($user)]);
}

if ($method === 'POST' && $path === '/api/auth/login') {
    $data = read_body();
    $email = strtolower(trim((string)($data['email'] ?? '')));
    $password = (string)($data['password'] ?? '');
    $users = load_json($usersFile, []);
    $found = null;
    foreach ($users as $item) {
        if (($item['email'] ?? '') === $email) {
            $found = $item;
            break;
        }
    }
    if (!$found || ($found['passwordHash'] ?? '') !== hash_password($password)) {
        send_json(401, ['error' => 'Неверный email или пароль.']);
    }
    send_json(200, ['token' => create_session((string)$found['id']), 'user' => public_user($found)]);
}

if ($method === 'POST' && $path === '/api/auth/logout') {
    $token = bearer_token();
    if ($token) {
        $sessions = load_json($sessionsFile, []);
        if (is_array($sessions)) {
            unset($sessions[$token]);
            save_json($sessionsFile, $sessions);
        }
    }
    send_json(200, ['ok' => true]);
}

if ($method === 'POST' && $path === '/api/applications') {
    $user = current_user();
    if (!$user) {
        send_json(401, ['error' => 'Войдите, чтобы отправить заявку.']);
    }
    $data = read_body();
    $service = trim((string)($data['service'] ?? ''));
    $serviceLabel = trim((string)($data['serviceLabel'] ?? '')) ?: $service;
    if ($service === '') {
        send_json(400, ['error' => 'Выберите услугу.']);
    }
    $app = [
        'id' => uid(),
        'userId' => $user['id'] ?? null,
        'service' => $service,
        'serviceLabel' => $serviceLabel,
        'date' => trim((string)($data['date'] ?? '')),
        'time' => trim((string)($data['time'] ?? '')),
        'car' => trim((string)($data['car'] ?? '')),
        'comment' => trim((string)($data['comment'] ?? '')),
        'status' => 'new',
        'createdAt' => gmdate('Y-m-d\TH:i:s\Z'),
    ];
    $apps = load_json($appsFile, []);
    $apps[] = $app;
    save_json($appsFile, $apps);
    send_json(201, ['item' => $app]);
}

if ($method === 'PATCH' && preg_match('#^/api/admin/applications/([^/]+)$#', $path, $match)) {
    $user = current_user();
    if (!$user || ($user['role'] ?? '') !== 'admin') {
        send_json(403, ['error' => 'Доступ только для администратора']);
    }
    $data = read_body();
    $status = trim((string)($data['status'] ?? ''));
    $allowed = ['new', 'progress', 'done', 'cancelled'];
    if (!in_array($status, $allowed, true)) {
        send_json(400, ['error' => 'Некорректный статус.']);
    }
    $apps = load_json($appsFile, []);
    $updated = null;
    foreach ($apps as &$app) {
        if (($app['id'] ?? '') === $match[1]) {
            $app['status'] = $status;
            $updated = $app;
            break;
        }
    }
    unset($app);
    if (!$updated) {
        send_json(404, ['error' => 'Заявка не найдена.']);
    }
    save_json($appsFile, $apps);
    send_json(200, ['item' => $updated]);
}

send_json(404, ['error' => 'Not found']);
