package br.dev.ci.mobmanager.client;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;

public class WebSocketClientConnection extends WebSocketClient {
    private final DeviceConnect deviceConnect;
    public WebSocketClientConnection(URI serverUri, DeviceConnect deviceConnect) {
        super(serverUri);
        this.deviceConnect = deviceConnect;
    }

    @Override
    public void onOpen(ServerHandshake handshakedata) {
        try {

        } catch (Exception e) {
            e.printStackTrace();
            // throw new RuntimeException(e);
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
        try {

        } catch (Exception e) {
            e.printStackTrace();
            // throw new RuntimeException(e);
        }
    }
}
