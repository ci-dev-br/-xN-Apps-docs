package br.dev.ci.mobmanager.client;

import android.os.Looper;
import android.util.Log;

import com.google.gson.Gson;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.util.Date;

import br.dev.ci.mobmanager.client.model.EventData;
import br.dev.ci.mobmanager.client.model.EventPayload;
import br.dev.ci.mobmanager.client.model.WSMessage;

public class WebSocketClientConnection extends WebSocketClient {
    private final DeviceConnect deviceConnect;
    private Long ping = 0L;
    public WebSocketClientConnection(URI serverUri, DeviceConnect deviceConnect) {
        super(serverUri);
        this.deviceConnect = deviceConnect;
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
        } catch (Exception e) {
            e.printStackTrace();
            // throw new RuntimeException(e);
        }
    }

    private void Ping(){
        try {
            EventPayload payload = new EventPayload();
            payload.setEvent("events");
            payload.setData(new EventData());
            payload.getData().setClient(payload.getData().getMac());
            payload.getData().setMomento((new Date()).getTime());
            payload.getData().setLastPing(ping);
            payload.getData().setType("ping");
            Gson mapper = new Gson();
            String payload_message = mapper.toJson(payload);
            send(payload_message);
        }catch (Exception ex){
            ex.printStackTrace();
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
            }else if(message.indexOf("\"type\":\"events\"") > -1){
                EventPayload retorno = mapper.fromJson(message, EventPayload.class);
                if(retorno.getData().getType() == "requestSendSMSMessage"){
                    if(retorno.getData().getContentText() != null && retorno.getData().getTo() != null ){
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

        } catch (Exception e) {
            e.printStackTrace();
            // throw new RuntimeException(e);
        }
    }

    @Override
    public void onError(Exception ex) {
        ex.printStackTrace();
    }
}
