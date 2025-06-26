package br.dev.ci.mobilemanger.client;

import android.os.AsyncTask;
import android.os.Looper;
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
            identity();
            // deviceConnect

        } catch (Exception e) {
            e.printStackTrace();
            // throw new RuntimeException(e);
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
                    8000);
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
        try {

        } catch (Exception e) {
            e.printStackTrace();
            // throw new RuntimeException(e);
        }
    }
}
