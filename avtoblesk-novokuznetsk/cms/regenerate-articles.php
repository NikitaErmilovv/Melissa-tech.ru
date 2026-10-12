<?php
declare(strict_types=1);

require __DIR__ . '/articles-lib.php';

$data = articles_load();
articles_regenerate_static($data);
echo "OK\n";
