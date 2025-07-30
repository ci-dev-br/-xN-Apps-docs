<?php 
// $step = 0;
// try {
//     $opts = [
//         "http" => [
//             "header" => "x-From: ".$_SERVER['HTTP_HOST']."\r\n",
//             'timeout' => 4
//         ]
//     ];
//     $context = stream_context_create($opts);
//     $contents = file_get_contents('https://apps.ci.dev.br'.$_SERVER['REQUEST_URI'],false, $context);
//     $headers = implode("\n", $http_response_header);
//     if (preg_match_all("/^content-type\s*:\s*(.*)$/mi", $headers, $matches)) {
//         $content_type = end($matches[1]);
//         header("Content-Type: $content_type");
//     }
//     print($contents);
//     $step = 1;
// }
// if($step == 0){
    // } catch (\Throwable $th) {
//     include 'index.csr.html';
// }
include 'index.csr.html';