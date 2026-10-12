<?php
declare(strict_types=1);

function articles_file_path(): string {
    return dirname(__DIR__) . '/data/articles.json';
}

function articles_load(): array {
    $path = articles_file_path();
    if (!is_file($path)) {
        return ['articles' => []];
    }
    $data = json_decode((string) file_get_contents($path), true);
    if (!is_array($data)) {
        return ['articles' => []];
    }
    if (!isset($data['articles']) || !is_array($data['articles'])) {
        $data['articles'] = [];
    }
    return $data;
}

function articles_save(array $data): void {
    $path = articles_file_path();
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n";
    if (file_put_contents($path, $json, LOCK_EX) === false) {
        throw new RuntimeException('Write failed');
    }
}

function articles_slugify(string $text): string {
    $map = [
        'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd', 'е' => 'e', 'ё' => 'e',
        'ж' => 'zh', 'з' => 'z', 'и' => 'i', 'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm',
        'н' => 'n', 'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't', 'у' => 'u',
        'ф' => 'f', 'х' => 'h', 'ц' => 'ts', 'ч' => 'ch', 'ш' => 'sh', 'щ' => 'sch', 'ъ' => '',
        'ы' => 'y', 'ь' => '', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
    ];
    $text = mb_strtolower(trim($text), 'UTF-8');
    $out = '';
    $len = mb_strlen($text, 'UTF-8');
    for ($i = 0; $i < $len; $i++) {
        $ch = mb_substr($text, $i, 1, 'UTF-8');
        if (isset($map[$ch])) {
            $out .= $map[$ch];
            continue;
        }
        if (preg_match('/[a-z0-9]/', $ch)) {
            $out .= $ch;
            continue;
        }
        $out .= '-';
    }
    $out = preg_replace('/-+/', '-', $out) ?? '';
    return trim((string) $out, '-') ?: 'article';
}

function articles_escape(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function articles_body_html(string $body): string {
    $parts = preg_split("/\n\s*\n/", trim($body)) ?: [];
    $html = '';
    foreach ($parts as $para) {
        $para = trim($para);
        if ($para === '') {
            continue;
        }
        $html .= '<p>' . nl2br(articles_escape($para), false) . '</p>';
    }
    return $html ?: '<p></p>';
}

/** @param array<int, array<string, mixed>> $articles */
function articles_sort_list(array $articles): array {
    usort($articles, static function ($a, $b) {
        $pa = !empty($a['pinned']) ? 1 : 0;
        $pb = !empty($b['pinned']) ? 1 : 0;
        if ($pa !== $pb) {
            return $pb <=> $pa;
        }
        $oa = (int) ($a['order'] ?? 0);
        $ob = (int) ($b['order'] ?? 0);
        if ($oa !== $ob) {
            return $ob <=> $oa;
        }
        $da = (string) ($a['publishedAt'] ?? '');
        $db = (string) ($b['publishedAt'] ?? '');
        return strcmp($db, $da);
    });
    return $articles;
}

function articles_public_list(array $data): array {
    $list = [];
    foreach ($data['articles'] ?? [] as $item) {
        if (!is_array($item) || !empty($item['hidden'])) {
            continue;
        }
        $list[] = $item;
    }
    return articles_sort_list($list);
}

/**
 * @param array<string, mixed> $article
 */
function articles_feed_row_html(array $article, string $base = ''): string {
    $slug = (string) ($article['slug'] ?? '');
    $href = articles_escape($base . 'works/' . rawurlencode($slug) . '/');
    $title = articles_escape((string) ($article['title'] ?? ''));
    $excerpt = articles_escape((string) ($article['excerpt'] ?? ''));
    $date = articles_escape(articles_format_date((string) ($article['publishedAt'] ?? '')));
    $dateAttr = articles_escape((string) ($article['publishedAt'] ?? ''));
    $cover = (string) ($article['cover'] ?? '');
    $gallery = is_array($article['gallery'] ?? null) ? $article['gallery'] : [];
    if ($cover === '' && $gallery) {
        $cover = (string) $gallery[0];
    }
    $pinned = !empty($article['pinned']);
    $pin = $pinned ? '<span class="article-row-pin">Закреплено</span>' : '';
    $rowClass = 'article-row' . ($pinned ? ' article-row--pinned' : '');
    if ($cover !== '') {
        $src = articles_escape($base . ltrim($cover, '/'));
        $media = '<a class="article-row-media" href="' . $href . '" tabindex="-1" aria-hidden="true"><img src="' . $src . '" alt="" loading="lazy" decoding="async"></a>';
    } else {
        $media = '<a class="article-row-media article-row-media--empty" href="' . $href . '" tabindex="-1" aria-hidden="true"><span>АвтоБлеск</span></a>';
    }
    return '<article class="' . $rowClass . '">' . $media .
        '<div class="article-row-body">' . $pin .
        '<time class="article-row-date" datetime="' . $dateAttr . '">' . $date . '</time>' .
        '<h2 class="article-row-title"><a href="' . $href . '">' . $title . '</a></h2>' .
        '<p class="article-row-excerpt">' . $excerpt . '</p>' .
        '<a class="button dark article-row-btn" href="' . $href . '">Читать статью</a>' .
        '</div></article>';
}

function articles_feed_inner_html(array $data, string $base = ''): string {
    $list = articles_public_list($data);
    if (!$list) {
        return '<p class="intro">Пока нет опубликованных материалов. Загляните позже.</p>';
    }
    $rows = '';
    foreach ($list as $article) {
        if (!is_array($article)) {
            continue;
        }
        $rows .= articles_feed_row_html($article, $base);
    }
    return '<div class="article-feed article-feed--magazine">' . $rows . '</div>';
}

function articles_patch_album_page(array $data): void {
    $root = dirname(__DIR__);
    $album = $root . '/album.html';
    if (!is_file($album)) {
        return;
    }
    $html = (string) file_get_contents($album);
    $inner = articles_feed_inner_html($data, '');
    $replacement = "<!-- ARTICLES_FEED -->\n" . $inner . "\n<!-- /ARTICLES_FEED -->";
    if (preg_match('/<!-- ARTICLES_FEED -->[\s\S]*?<!-- \/ARTICLES_FEED -->/', $html)) {
        $html = preg_replace('/<!-- ARTICLES_FEED -->[\s\S]*?<!-- \/ARTICLES_FEED -->/', $replacement, $html) ?? $html;
    } else {
        return;
    }
    file_put_contents($album, $html, LOCK_EX);
}

function articles_format_date(string $iso): string {
    if ($iso === '') {
        return '';
    }
    $ts = strtotime($iso);
    if ($ts === false) {
        return articles_escape($iso);
    }
    return date('j.m.Y', $ts);
}

/**
 * @param array<string, mixed> $article
 */
function articles_render_page_html(array $article, string $rel = '../'): string {
    $site = 'https://autoblesk42.ru';
    $slug = (string) ($article['slug'] ?? '');
    $title = (string) ($article['title'] ?? 'Статья');
    $metaTitle = trim((string) ($article['metaTitle'] ?? '')) ?: ($title . ' — АвтоБлеск');
    $metaDesc = trim((string) ($article['metaDescription'] ?? '')) ?: trim((string) ($article['excerpt'] ?? ''));
    $cover = (string) ($article['cover'] ?? '');
    $ogImage = $cover !== '' ? $site . '/' . ltrim($cover, '/') : $site . '/img/icon-512.png';
    $canonical = $site . '/works/' . rawurlencode($slug) . '/';
    $bodyHtml = articles_body_html((string) ($article['body'] ?? ''));
    $date = articles_format_date((string) ($article['publishedAt'] ?? ''));
    $gallery = is_array($article['gallery'] ?? null) ? $article['gallery'] : [];
    $galleryHtml = '';
    foreach ($gallery as $url) {
        if (!is_string($url) || $url === '') {
            continue;
        }
        $href = articles_escape($rel . ltrim($url, '/'));
        $galleryHtml .= '<a class="g g--media" href="' . $href . '" data-lightbox="article"><img src="' . $href . '" alt="" loading="lazy" decoding="async"></a>';
    }

    $navWorks = articles_escape($rel . 'album.html');

    return '<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="' . articles_escape($metaDesc) . '">
<link rel="canonical" href="' . articles_escape($canonical) . '">
<title>' . articles_escape($metaTitle) . '</title>
<link rel="icon" href="' . articles_escape($rel) . 'favicon.ico" sizes="any">
<link rel="stylesheet" href="' . articles_escape($rel) . 'styles.css?v=works4">
<link rel="stylesheet" href="' . articles_escape($rel) . 'cms/cms.css?v=text1">
<meta property="og:type" content="article">
<meta property="og:site_name" content="АвтоБлеск">
<meta property="og:title" content="' . articles_escape($metaTitle) . '">
<meta property="og:description" content="' . articles_escape($metaDesc) . '">
<meta property="og:url" content="' . articles_escape($canonical) . '">
<meta property="og:image" content="' . articles_escape($ogImage) . '">
</head>
<body>
<nav class="site-nav">
  <div class="logo"><a href="' . articles_escape($rel) . 'index.html"><span>АВТО</span>БЛЕСК</a></div>
  <div class="links"><a href="' . articles_escape($rel) . 'index.html#services">УСЛУГИ</a><a href="' . articles_escape($rel) . 'index.html#story">О СТУДИИ</a><a href="' . articles_escape($rel) . 'index.html#contacts">КОНТАКТЫ</a><a href="' . articles_escape($rel) . 'training.html">ОБУЧЕНИЕ</a><a href="' . $navWorks . '">НАШИ РАБОТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="tel:+79235322652">+7 (923) 532-26-52</a>
    <button class="nav-burger" type="button" aria-label="Открыть меню" aria-expanded="false">
      <span class="nav-burger-line"></span><span class="nav-burger-line"></span><span class="nav-burger-line"></span>
    </button>
  </div>
  <div class="nav-mobile-menu">
    <a href="' . articles_escape($rel) . 'index.html#services">УСЛУГИ</a>
    <a href="' . articles_escape($rel) . 'index.html#story">О СТУДИИ</a>
    <a href="' . articles_escape($rel) . 'index.html#contacts">КОНТАКТЫ</a>
    <a href="' . articles_escape($rel) . 'training.html">ОБУЧЕНИЕ</a>
    <a href="' . $navWorks . '">НАШИ РАБОТЫ</a>
  </div>
</nav>
<article class="article-page">
  <header class="article-page-hero subpage-hero">
    <div class="kicker">НАШИ РАБОТЫ</div>
    <h1>' . articles_escape($title) . '</h1>
    ' . ($date !== '' ? '<p class="article-page-date">' . $date . '</p>' : '') . '
    ' . (trim((string) ($article['excerpt'] ?? '')) !== '' ? '<p class="article-page-lead">' . articles_escape((string) $article['excerpt']) . '</p>' : '') . '
  </header>
  ' . ($cover !== '' ? '<figure class="article-page-cover"><img src="' . articles_escape($rel . ltrim($cover, '/')) . '" alt="' . articles_escape($title) . '" width="1200" height="675" loading="eager" decoding="async"></figure>' : '') . '
  <div class="article-page-body section">' . $bodyHtml . '</div>
  ' . ($galleryHtml !== '' ? '<div class="section gallery gallery--portfolio article-page-gallery">' . $galleryHtml . '</div>' : '') . '
  <p class="section intro"><a class="button dark" href="' . $navWorks . '">← Все работы</a></p>
</article>
<footer class="site-footer" style="margin-top:48px">
  <div class="footer-bottom">
    <span>© 2026 Детейлинг-студия «АвтоБлеск». Все права защищены.</span>
    <span class="footer-requisites"><a class="footer-legal-link" href="' . articles_escape($rel) . 'legal.html">Документы</a></span>
  </div>
</footer>
<script src="' . articles_escape($rel) . 'nav.js"></script>
<script src="' . articles_escape($rel) . 'gallery-lightbox.js" defer></script>
</body>
</html>';
}

function articles_regenerate_static(array $data): void {
    $root = dirname(__DIR__);
    $worksDir = $root . '/works';
    if (!is_dir($worksDir) && !mkdir($worksDir, 0775, true) && !is_dir($worksDir)) {
        throw new RuntimeException('works dir');
    }
    $wanted = [];
    foreach ($data['articles'] ?? [] as $article) {
        if (!is_array($article) || !empty($article['hidden'])) {
            continue;
        }
        $slug = preg_replace('/[^a-z0-9-]/', '', (string) ($article['slug'] ?? '')) ?? '';
        if ($slug === '') {
            continue;
        }
        $wanted[$slug] = true;
        $dir = $worksDir . '/' . $slug;
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException('mkdir ' . $slug);
        }
        $html = articles_render_page_html($article, '../../');
        file_put_contents($dir . '/index.html', $html, LOCK_EX);
    }
    foreach (glob($worksDir . '/*', GLOB_ONLYDIR) ?: [] as $dir) {
        $slug = basename($dir);
        if (!isset($wanted[$slug])) {
            $index = $dir . '/index.html';
            if (is_file($index)) {
                unlink($index);
            }
            @rmdir($dir);
        }
    }
    articles_update_sitemap($data, $root);
    articles_patch_album_page($data);
}

function articles_update_sitemap(array $data, string $root): void {
    $path = $root . '/sitemap.xml';
    if (!is_file($path)) {
        return;
    }
    $xml = (string) file_get_contents($path);
    $base = 'https://autoblesk42.ru';
    $urls = [$base . '/album.html'];
    foreach (articles_public_list($data) as $article) {
        $slug = (string) ($article['slug'] ?? '');
        if ($slug === '') {
            continue;
        }
        $urls[] = $base . '/works/' . rawurlencode($slug) . '/';
    }
    $urls = array_values(array_unique($urls));
    $block = '';
    foreach ($urls as $loc) {
        if (strpos($xml, '<loc>' . $loc . '</loc>') !== false) {
            continue;
        }
        $block .= "  <url><loc>" . $loc . "</loc></url>\n";
    }
    if ($block === '') {
        return;
    }
    $xml = preg_replace('/<\/urlset>\s*$/', $block . '</urlset>', $xml) ?? $xml;
    file_put_contents($path, $xml, LOCK_EX);
}

function articles_normalize_payload(array $payload): array {
    if (!isset($payload['articles']) || !is_array($payload['articles'])) {
        throw new InvalidArgumentException('Missing articles');
    }
    $seen = [];
    $clean = [];
    foreach ($payload['articles'] as $i => $raw) {
        if (!is_array($raw)) {
            continue;
        }
        $title = trim((string) ($raw['title'] ?? ''));
        if ($title === '') {
            continue;
        }
        $slug = trim((string) ($raw['slug'] ?? ''));
        if ($slug === '') {
            $slug = articles_slugify($title);
        }
        $slug = preg_replace('/[^a-z0-9-]/', '', strtolower($slug)) ?? '';
        if ($slug === '') {
            $slug = 'article-' . ($i + 1);
        }
        $base = $slug;
        $n = 2;
        while (isset($seen[$slug])) {
            $slug = $base . '-' . $n;
            $n++;
        }
        $seen[$slug] = true;
        $gallery = [];
        if (is_array($raw['gallery'] ?? null)) {
            foreach ($raw['gallery'] as $g) {
                if (is_string($g) && $g !== '') {
                    $gallery[] = $g;
                }
            }
        }
        $clean[] = [
            'id' => trim((string) ($raw['id'] ?? '')) ?: ('art-' . bin2hex(random_bytes(4))),
            'slug' => $slug,
            'title' => mb_substr($title, 0, 200),
            'excerpt' => mb_substr(trim((string) ($raw['excerpt'] ?? '')), 0, 400),
            'body' => (string) ($raw['body'] ?? ''),
            'cover' => trim((string) ($raw['cover'] ?? '')),
            'gallery' => $gallery,
            'publishedAt' => trim((string) ($raw['publishedAt'] ?? date('Y-m-d'))),
            'pinned' => !empty($raw['pinned']),
            'hidden' => !empty($raw['hidden']),
            'order' => (int) ($raw['order'] ?? 0),
            'metaTitle' => mb_substr(trim((string) ($raw['metaTitle'] ?? '')), 0, 180),
            'metaDescription' => mb_substr(trim((string) ($raw['metaDescription'] ?? '')), 0, 320),
        ];
    }
    return ['articles' => $clean];
}
