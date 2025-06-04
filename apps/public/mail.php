<?php 
$json_input = file_get_contents('php://input');
$data = json_decode($json_input);
if(isset($data->to) && isset($data->x) && isset($data->from) && isset($data->subject) && isset($data->message)){
    $x_hash = hash('sha256', '1450152c-ffc4-4daa-9f04-51a23d27b115.'.$data->to.'.apps.ci.dev.br');
    if($x_hash === $data->x){
            
        $to      = ''.$data->to;
        $from      = ''.$data->from;
        $subject = ''.$data->subject;
        $message = ''.$data->message;
        
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= 'From: '.$from.''       . "\r\n" .
                'X-Mailer: PHP/' . phpversion();
                
        mail($to, $subject, $message, $headers);

        print_r("sent");
    }else{
        print_r("fail");
    }
} else {
}