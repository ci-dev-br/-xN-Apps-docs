<?php 
try {
    $contents = file_get_contents('https://apps.ci.dev.br'.$_SERVER['REQUEST_URI'].'?from='.$_SERVER['HTTP_HOST']);
    $headers = implode("\n", $http_response_header);
    if (preg_match_all("/^content-type\s*:\s*(.*)$/mi", $headers, $matches)) {
        $content_type = end($matches[1]);
        header("Content-Type: $content_type");
    }
    print($contents);
} catch (\Throwable $th) {
    //throw $th;
    include 'index.csr.html';
}