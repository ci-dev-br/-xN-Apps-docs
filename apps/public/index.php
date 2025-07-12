<?php 
$ctx = stream_context_create(array('http'=>
    array(
        'timeout' => 1,  //1200 Seconds is 20 Minutes
    )
));

try {
    //code...
    $jsonData = file_get_contents('https://apps.ci.dev.br'.$_SERVER['REQUEST_URI'].'?from='.$_SERVER['HTTP_HOST'], false, $ctx);
    print $jsonData;
} catch (\Throwable $th) {
    //throw $th;
}

include 'index.csr.html';