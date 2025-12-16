package br.dev.ci.mobilemanger.client;
import android.os.AsyncTask;
import android.os.Looper;
import android.telephony.SmsManager;
import android.util.Log;

import com.google.gson.Gson;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.util.Date;

import br.dev.ci.mobilemanger.client.model.EventData;
import br.dev.ci.mobilemanger.client.model.EventPayload;
import br.dev.ci.mobilemanger.client.model.WSMessage;

public class WebSocketClientConnection extends WebSocketClient {
    private Boolean ativado = false;
    private Long ping = 0L;
    private String status;
    public WebSocketClientConnection(URI serverUri){
        super(serverUri);
    }
    public WebSocketClientConnection(URI serverUri, DeviceConnect deviceConnect) {
        super(serverUri);
    }
    /**
     * Conexão aberta
     */
    @Override
    public void onOpen(ServerHandshake handshakedata) {
        try {
            /*
             *  HandShake
             * 1 -> Identificação da conexão com id do Dispositivo (Device);
             *
             */
            if(ativado==false){
                Ping();
                ativado = true;
            }
            identity();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    /**
     * Identificação do dispositivo
     */
    private void identity(){
        try {
            EventPayload payload =  new EventPayload();
            payload.setEvent("events");
            EventData event = new EventData();
            event.setMomento((new Date()).getTime());
            event.setMac(ManagerClient.getInstance().getMacAddr());
            payload.setData(event);
            Gson mapper = new Gson();
            send(mapper.toJson(payload));
        }catch (Exception ex){
            ex.printStackTrace();
        }
    }
    private String stauts = "out";
    /**
     * Ping
     */
    private void Ping(){
        new android.os.Handler(Looper.getMainLooper()).postDelayed(
                new Runnable() {
                    public void run() {
                        // if(stauts.equals("pong")){
                            Ping();
                        // }
                    }
                },
                60000);
        if(this.stauts.equals("ping")) {
            return;
        }
        try {
            this.stauts = "ping";
            EventPayload payload =  new EventPayload();
            payload.setEvent("events");
            EventData event = new EventData();
            event.setMomento((new Date()).getTime());
            event.setLastPing(ping);
            event.setType("ping");
            payload.setData(event);
            Gson mapper = new Gson();
            send(mapper.toJson(payload));
        }catch (Exception ex){
            ex.printStackTrace();
            new android.os.Handler(Looper.getMainLooper()).postDelayed(
                    new Runnable() {
                        public void run() {
                            Ping();
                        }
                    },
                    1000);
        }
    }
    /**
     * Pong Handler
     */
    private void PongHandler(){
        // TODO: pong handler action
    }
    /**
     * Mensagem recebida
     */
    @Override
    public void onMessage(String message) {
        try {
            Gson mapper = new Gson();
            if(message.indexOf("\"type\":\"pong\"") > -1){
                WSMessage retorno = mapper.fromJson(message, WSMessage.class);
                if(retorno.getType().equals("pong")){
                                    Log.i("tag", "Ping/Pong");
                    this.stauts = "out";
                    this.PongHandler();
                    if(retorno.getWait() != null){
                        new android.os.Handler(Looper.getMainLooper()).postDelayed(
                                new Runnable() {
                                    public void run() {
                                        stauts = "pong";
                                        Ping();
                                    }
                                }, (retorno.getWait() != null ? retorno.getWait().intValue() : 15000));
                    }
                }
            }else if(message.indexOf("\"type\":\"requestSendSMSMessage\"") > -1){
                EventPayload retorno = mapper.fromJson(message, EventPayload.class);
                if(retorno.getData().getType().equals("requestSendSMSMessage")){
                    try {
                        if(retorno.getData().getContentText() != null && retorno.getData().getTo() != null ){
                            SmsManager smsManager=SmsManager.getDefault();

                            smsManager.sendTextMessage(retorno.getData().getTo(),null,retorno.getData().getContentText(),null,null);
                        }
                    }catch(Exception ex){
                        ex.printStackTrace();
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            Ping();
        }
    }
    /**
     * Conexão encerrada
     */
    @Override
    public void onClose(int code, String reason, boolean remote) {
        try {
            this.tryReconnect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     *  Tentar reconectar ao servidor
     */
    private void tryReconnect(){
        try {
            if(this.isClosed() != false){
                try{
                    this.close();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            new android.os.Handler(Looper.getMainLooper()).postDelayed(
                    new Runnable() {
                        public void run() {
                            try{
                                reconnect();
                                new android.os.Handler(Looper.getMainLooper()).postDelayed(
                                        new Runnable() {
                                            public void run() {
                                                try{
                                                    if(isClosed() == true || isClosing() == true){
                                                        tryReconnect();

                                                    }
                                                } catch (Exception e) {
                                                    e.printStackTrace();
                                                }
                                            }
                                        },
                                        10000);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    },
                    1000);
        }catch (Exception ex){
            ex.printStackTrace();
        }
    }

    /**
     * Erro na conexão
     */
    @Override
    public void onError(Exception ex) {
        try {
            if(this.isClosed()){
                this.tryReconnect();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
