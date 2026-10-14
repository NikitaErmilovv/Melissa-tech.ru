<?php
declare(strict_types=1);
require __DIR__ . '/cms/articles-lib.php';
$slug = preg_replace('/[^a-z0-9-]/', '', strtolower((string) ($_GET['slug'] ?? ''))) ?? '';
if ($slug === '') {
    http_response_code(404);
    echo 'Not found';
    exit;
}
$data = articles_load();
$found = null;
foreach ($data['articles'] ?? [] as $article) {
    if (is_array($article) && empty($article['hidden']) && (string) ($article['slug'] ?? '') === $slug) {
        $found = $article;
        break;
    }
}
if ($found === null) {
    http_response_code(404);
    echo 'Not found';
    exit;
}
header('Content-Type: text/html; charset=utf-8');
echo articles_render_page_html($found, './');
