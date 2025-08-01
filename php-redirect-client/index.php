<?php
$jsonData = file_get_contents('https://apps.ci.dev.br'.$_SERVER['REQUEST_URI'].'?from='.$_SERVER['HTTP_HOST']);
print $jsonData;
?>