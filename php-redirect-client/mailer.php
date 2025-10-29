<?php /**********************************************************************
 * ci.dev.br - Ambiente de Desenvolvimento Integrado
 * Author: plhx.com.br, 2025
 * Project Owner: ci.dev.br
 * 
 ****************************************************************************/
$HASH_MASTER= '250c67d7-8d46-4dd9-94c2-4bc8b5b78c17';
$HOST_NAME = 'apps.ci.dev.br';
$raw_body = file_get_contents('php://input');
$out_result = new stdClass();
if(!empty($raw_body)){
    $data_object = json_decode($raw_body);
    $status_code = -1;
    $x_hash = hash('sha256', $HASH_MASTER.'.'.$data_object->content_payload->to.'.'.$HOST_NAME);
    if($data_object->action === "send_mail_message"){
        $status_code = 2;
        if($x_hash === $data_object->x_hash ){
                $to      = ''.$data_object->content_payload->to;
                $subject = ''.$data_object->content_payload->subject;
                $message = ''.$data_object->content_payload->message_html;
                $headers = "MIME-Version: 1.0" . "\r\n";
                $headers .= "Content-type:".$data_object->content_payload->content_type. "\r\n";
                $headers .= 'From: '.$data_object->content_payload->from.''. "\r\n" .'X-Mailer: PHP/' . phpversion() ;
                mail($to, $subject, $message, $headers);
                $status_code = 0;
        }else{
            $status_code *= -1;
        }
    }
    $out_result->code = $status_code;
}else{
   //  header("Location: https://apps.ci.dev.br");
}
print_r(json_encode($out_result));
?>