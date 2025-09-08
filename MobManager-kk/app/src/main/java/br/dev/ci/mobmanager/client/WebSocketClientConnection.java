package br.dev.ci.mobmanager.client;

import com.google.gson.Gson;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.util.Date;

import br.dev.ci.mobmanager.client.model.EventData;
import br.dev.ci.mobmanager.client.model.EventPayload;

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
            EventPayload payload =  new EventPayload(){{
                setEvent("events");
                setData(new EventData(){{
                    setMomentum((new Date()).getTime());
                    setLastPing(ping);
                    setType("ping");
                }});
            }};
            Gson mapper = new Gson();
            send(mapper.toJson(payload));
        }catch (Exception ex){
            ex.printStackTrace();
        }
    }

    @Override
    public void onMessage(String message) {
        /// Definir rotina de recepção das mensagens do web socket.
        try {

        } catch (Exception e) {
            e.printStackTrace();
            // throw new RuntimeException(e);


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
