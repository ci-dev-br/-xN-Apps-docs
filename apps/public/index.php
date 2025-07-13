<?php 
try {
    $contents = file_get_contents('https://apps.ci.dev.br'.$_SERVER['REQUEST_URI']);
    $headers = implode("\n", $http_response_header);
    if (preg_match_all("/^content-type\s*:\s*(.*)$/mi", $headers, $matches)) {
        $content_type = end($matches[1]);
        header("Content-Type: $content_type");
        header("x-From: ".$_SERVER['HTTP_HOST']);
    }
    print($contents);
} catch (\Throwable $th) {
    include 'index.csr.html';
}