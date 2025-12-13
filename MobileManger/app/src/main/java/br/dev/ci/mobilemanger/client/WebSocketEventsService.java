package br.dev.ci.mobilemanger.client;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import org.java_websocket.client.WebSocketClient;

import java.net.NetworkInterface;
import java.net.URI;
import java.util.Collections;
import java.util.List;

import br.dev.ci.mobilemanger.R;

public class WebSocketEventsService extends Service {
    public static final String CHANNEL_ID = "ForegroundServiceChannel";


    private WebSocketClient webSocketClient;

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void startWebSocket() {
        URI uri = URI.create("wss://apps.ci.dev.br");
        webSocketClient = new WebSocketClientConnection(uri, null);
        webSocketClient.connect();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();
        // 4. Inicie o WebSocket
        startWebSocket();

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("xNë/CI Mobile Services")
                .setContentText("Serviços Ativos")
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ECLAIR) {
            startForeground(1, notification);
        }

        new Thread(new Runnable() {
            @Override
            public void run() {
                while (true) {
                    // Seu loop ou lógica de longa duração
                    try {
                        Thread.sleep(5000); // Exemplo
                        System.out.println("{{Serviço Ativo}}");
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        }).start();

        // O sistema tentará recriar o serviço se ele for encerrado.
        return START_STICKY;
    }
    @Override
    public void onDestroy() {
        super.onDestroy();
        if (webSocketClient != null) {
            webSocketClient.close();
        }
    }

    private String getMacAddr() {
        try {
            List<NetworkInterface> all = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface nif : all) {
                if (!nif.getName().equalsIgnoreCase("wlan0")) continue;
                byte[] macBytes = nif.getHardwareAddress();
                if (macBytes == null) {
                    return "";
                }
                StringBuilder res1 = new StringBuilder();
                for (byte b : macBytes) {
                    res1.append(Integer.toHexString(b & 0xFF) + ":");
                }
                if (res1.length() > 0) {
                    res1.deleteCharAt(res1.length() - 1);
                }
                return res1.toString();
            }
        } catch (Exception ex) {
            //handle exception
        }
        return "";
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "ci.dev.br Services",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }
}
