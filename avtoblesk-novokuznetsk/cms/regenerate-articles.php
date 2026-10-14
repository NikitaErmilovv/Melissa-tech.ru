<?php
declare(strict_types=1);
require __DIR__ . '/articles-lib.php';
articles_regenerate_static(articles_load());
echo "OK\n";
