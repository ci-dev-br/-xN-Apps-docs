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
    private Long ping = 0L;
    public WebSocketClientConnection(URI serverUri){
        super(serverUri);
    }
    public WebSocketClientConnection(URI serverUri, DeviceConnect deviceConnect) {
        super(serverUri);
    }
    @Override
    public void onOpen(ServerHandshake handshakedata) {
        try {
            /*
             *  HandShake
             * 1 -> Identificação da conexão com id do Dispositivo (Device);
             *
             */
            Ping();
            identity();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    private void identity(){
        try {
            EventPayload payload =  new EventPayload();
            payload.setEvent("events");
            EventData event = new EventData();
            event.setMomentum((new Date()).getTime());
            event.setMac(ManagerClient.getInstance().getMacAddr());
            payload.setData(event);
            Gson mapper = new Gson();
            send(mapper.toJson(payload));
        }catch (Exception ex){
            ex.printStackTrace();
        }
    }
    private void Ping(){
        try {
            EventPayload payload =  new EventPayload();
            payload.setEvent("events");

            EventData event = new EventData();

            event.setMomentum((new Date()).getTime());
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
                    60000);
        }
    }

    private void PongHandler(){
        // TODO: pong handler action
    }

    @Override
    public void onMessage(String message) {
        try {
            Gson mapper = new Gson();
            if(message.indexOf("\"type\":\"pong\"") > -1){
                WSMessage retorno = mapper.fromJson(message, WSMessage.class);
                if(retorno.getType().equals("pong")){
                                    Log.i("tag", "Pong");
                    this.PongHandler();
                    if(retorno.getWait() != null){
                        new android.os.Handler(Looper.getMainLooper()).postDelayed(
                                new Runnable() {
                                    public void run() {
                                        Ping();
                                    }
                                },
                                retorno.getWait().intValue());
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

    @Override
    public void onClose(int code, String reason, boolean remote) {
        try {
            this.connect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onError(Exception ex) {
        try {
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
